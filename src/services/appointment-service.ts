import { AppError } from "@/lib/errors";
import { getDb, getFirebaseAuth } from "@/lib/firebase";
import { formatDateTime } from "@/lib/format";
import { toIso } from "@/lib/firestore-utils";
import type { Appointment, ConsultationType, Doctor, DoctorSlot } from "@/types/models";
import { collection, doc, onSnapshot, query, serverTimestamp, Timestamp, where, writeBatch, type DocumentData } from "firebase/firestore";

export type BookInput = {
  doctor: Doctor;
  slot: DoctorSlot;
  consultation_type: ConsultationType;
  reason_for_visit: string | null;
};

function toAppointment(id: string, d: DocumentData): Appointment {
  const now = new Date().toISOString();
  return {
    id,
    patient_id: d.patient_id ?? "",
    slot_id: d.slot_id ?? "",
    doctor_id: d.doctor_id ?? "",
    doctor_name: d.doctor_name ?? "",
    specialty_name: d.specialty_name ?? "",
    clinic_name: d.clinic_name ?? "",
    consultation_fee_minor: Number(d.consultation_fee_minor ?? 0),
    currency_code: d.currency_code ?? "USD",
    doctor_color: d.doctor_color ?? "#2563EB",
    starts_at: toIso(d.starts_at) ?? now,
    ends_at: toIso(d.ends_at) ?? now,
    consultation_type: d.consultation_type === "video_call" ? "video_call" : "in_person",
    reason_for_visit: d.reason_for_visit ?? null,
    status: d.status === "cancelled" ? "cancelled" : d.status === "completed" ? "completed" : "confirmed",
    created_at: toIso(d.created_at) ?? now,
    updated_at: toIso(d.updated_at) ?? now,
  };
}

function currentUid(): string {
  const uid = getFirebaseAuth().currentUser?.uid;
  if (!uid) throw new AppError("Sign in to manage your appointments.");
  return uid;
}

// The security rules reject a booking if the slot was taken or the doctor stopped taking bookings between the
// moment the patient opened the screen and the moment they confirmed. Both surface as permission-denied.
function translateWriteError(error: unknown, message: string): never {
  const code = (error as { code?: string } | null)?.code;
  if (code === "permission-denied" || code === "failed-precondition" || code === "not-found") throw new AppError(message);
  throw error;
}

export const appointmentService = {
  /** Live list of the signed-in patient's appointments, soonest first. */
  subscribeMine(uid: string, onData: (items: Appointment[]) => void, onError: (error: Error) => void) {
    const q = query(collection(getDb(), "appointments"), where("patient_id", "==", uid));
    return onSnapshot(
      q,
      (snap) =>
        onData(
          snap.docs
            .map((d) => toAppointment(d.id, d.data({ serverTimestamps: "estimate" })))
            .sort((a, b) => a.starts_at.localeCompare(b.starts_at)),
        ),
      onError,
    );
  },

  /**
   * Books a slot. The appointment, the slot reservation and the confirmation notification are written in one
   * atomic batch, and the security rules verify the slot is free, in the future and belongs to this doctor.
   */
  async book(input: BookInput): Promise<Appointment> {
    const uid = currentUid();
    const { doctor, slot } = input;
    if (!doctor.is_bookable) throw new AppError("This doctor isn't taking bookings right now.");
    if (new Date(slot.starts_at).getTime() <= Date.now()) throw new AppError("That time has already passed. Pick another slot.");

    const db = getDb();
    const appointmentRef = doc(collection(db, "appointments"));
    const reason = input.reason_for_visit?.trim() || null;
    const batch = writeBatch(db);

    batch.set(appointmentRef, {
      patient_id: uid,
      slot_id: slot.id,
      doctor_id: doctor.id,
      doctor_name: doctor.full_name,
      specialty_name: doctor.specialty_name,
      clinic_name: doctor.clinic_name,
      consultation_fee_minor: doctor.consultation_fee_minor,
      currency_code: doctor.currency_code,
      doctor_color: doctor.color,
      starts_at: Timestamp.fromDate(new Date(slot.starts_at)),
      ends_at: Timestamp.fromDate(new Date(slot.ends_at)),
      consultation_type: input.consultation_type,
      reason_for_visit: reason,
      status: "confirmed",
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    batch.update(doc(db, "doctors", doctor.id, "slots", slot.id), {
      is_available: false,
      appointment_id: appointmentRef.id,
      updated_at: serverTimestamp(),
    });
    batch.set(doc(collection(db, "users", uid, "notifications")), {
      type: "appointment",
      title: "Appointment confirmed",
      body: `${doctor.full_name} • ${formatDateTime(slot.starts_at)}`,
      icon: "event-available",
      appointment_id: appointmentRef.id,
      read: false,
      created_at: serverTimestamp(),
    });

    try {
      await batch.commit();
    } catch (error) {
      translateWriteError(error, "Sorry, that time was just taken or is no longer available. Please pick another slot.");
    }

    const now = new Date().toISOString();
    return {
      id: appointmentRef.id,
      patient_id: uid,
      slot_id: slot.id,
      doctor_id: doctor.id,
      doctor_name: doctor.full_name,
      specialty_name: doctor.specialty_name,
      clinic_name: doctor.clinic_name,
      consultation_fee_minor: doctor.consultation_fee_minor,
      currency_code: doctor.currency_code,
      doctor_color: doctor.color,
      starts_at: slot.starts_at,
      ends_at: slot.ends_at,
      consultation_type: input.consultation_type,
      reason_for_visit: reason,
      status: "confirmed",
      created_at: now,
      updated_at: now,
    };
  },

  /** Cancels a confirmed appointment and frees its slot for other patients, atomically. */
  async cancel(appointment: Appointment): Promise<void> {
    const uid = currentUid();
    if (appointment.status !== "confirmed") throw new AppError("This appointment can't be cancelled.");
    const db = getDb();
    const batch = writeBatch(db);
    batch.update(doc(db, "appointments", appointment.id), { status: "cancelled", updated_at: serverTimestamp() });
    batch.update(doc(db, "doctors", appointment.doctor_id, "slots", appointment.slot_id), {
      is_available: true,
      appointment_id: null,
      updated_at: serverTimestamp(),
    });
    batch.set(doc(collection(db, "users", uid, "notifications")), {
      type: "appointment",
      title: "Appointment cancelled",
      body: `${appointment.doctor_name} • ${formatDateTime(appointment.starts_at)}`,
      icon: "event-busy",
      appointment_id: appointment.id,
      read: false,
      created_at: serverTimestamp(),
    });
    try {
      await batch.commit();
    } catch (error) {
      translateWriteError(error, "This appointment can no longer be cancelled. It may already have been cancelled.");
    }
  },
};
