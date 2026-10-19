import { getDb } from "@/lib/firebase";
import { toIso } from "@/lib/firestore-utils";
import type { Doctor, DoctorSlot, Specialty } from "@/types/models";
import { collection, getDocs, limit, onSnapshot, orderBy, query, Timestamp, where, type DocumentData } from "firebase/firestore";

function toSpecialty(id: string, d: DocumentData): Specialty {
  return { id, name: d.name ?? id, icon: d.icon ?? "medical-services" };
}

function toDoctor(id: string, d: DocumentData): Doctor {
  return {
    id,
    full_name: d.full_name ?? "",
    specialty_id: d.specialty_id ?? "",
    specialty_name: d.specialty_name ?? "",
    clinic_name: d.clinic_name ?? "",
    rating: Number(d.rating ?? 0),
    review_count: Number(d.review_count ?? 0),
    years_experience: Number(d.years_experience ?? 0),
    consultation_fee_minor: Number(d.consultation_fee_minor ?? 0),
    currency_code: d.currency_code ?? "USD",
    biography: d.biography ?? "",
    is_bookable: d.is_bookable === true,
    color: d.color ?? "#2563EB",
  };
}

function toSlot(doctorId: string, id: string, d: DocumentData): DoctorSlot {
  const start = toIso(d.starts_at) ?? new Date(0).toISOString();
  return {
    id,
    doctor_id: doctorId,
    starts_at: start,
    ends_at: toIso(d.ends_at) ?? start,
    is_available: d.is_available === true,
    appointment_id: d.appointment_id ?? null,
  };
}

export const catalogService = {
  async listSpecialties(): Promise<Specialty[]> {
    const snap = await getDocs(query(collection(getDb(), "specialties"), orderBy("name")));
    return snap.docs.map((d) => toSpecialty(d.id, d.data()));
  },

  async listDoctors(): Promise<Doctor[]> {
    const snap = await getDocs(query(collection(getDb(), "doctors"), orderBy("full_name")));
    return snap.docs.map((d) => toDoctor(d.id, d.data()));
  },

  /**
   * Live list of a doctor's free future slots, so a time another patient just took disappears immediately.
   * The query filters on one field only (no composite index needed); availability is filtered here.
   */
  subscribeOpenSlots(doctorId: string, onData: (slots: DoctorSlot[]) => void, onError: (error: Error) => void) {
    const q = query(
      collection(getDb(), "doctors", doctorId, "slots"),
      where("starts_at", ">", Timestamp.now()),
      orderBy("starts_at"),
      limit(500),
    );
    return onSnapshot(
      q,
      (snap) => onData(snap.docs.map((d) => toSlot(doctorId, d.id, d.data())).filter((s) => s.is_available)),
      onError,
    );
  },
};
