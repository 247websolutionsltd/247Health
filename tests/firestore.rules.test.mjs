// Security-rules tests for firebase/firestore.rules. Every write below is the same shape the app sends.
//
//   npm i -D @firebase/rules-unit-testing firebase firebase-tools
//   npx firebase emulators:exec --only firestore --project demo-carenest "node --test tests/firestore.rules.test.mjs"
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, Timestamp, updateDoc, where, writeBatch } from "firebase/firestore";
import { readFileSync } from "node:fs";
import { after, before, beforeEach, describe, test } from "node:test";

const PROJECT_ID = "demo-carenest";
const DOCTOR = {
  id: "dr-test", full_name: "Dr. Test", specialty_id: "general", specialty_name: "General", clinic_name: "Test Clinic",
  rating: 4.5, review_count: 1, years_experience: 5, consultation_fee_minor: 2500, currency_code: "USD",
  biography: "", is_bookable: true, color: "#2563EB",
};
const SLOT_ID = "slot-1";
const startsAt = Timestamp.fromMillis(Date.now() + 3 * 24 * 3600_000);
const endsAt = Timestamp.fromMillis(startsAt.toMillis() + 30 * 60_000);

let env;
before(async () => {
  env = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: readFileSync(new URL("../firebase/firestore.rules", import.meta.url), "utf8") },
  });
});
after(async () => { await env?.cleanup(); });

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    const { id, ...doctor } = DOCTOR;
    await setDoc(doc(db, "doctors", id), doctor);
    await setDoc(doc(db, "specialties", "general"), { name: "General", icon: "medical-services" });
    await setDoc(doc(db, "doctors", id, "slots", SLOT_ID), { starts_at: startsAt, ends_at: endsAt, is_available: true, appointment_id: null, updated_at: Timestamp.now() });
  });
});

const dbFor = (uid) => env.authenticatedContext(uid).firestore();

// Same batch the app sends in services/appointment-service.ts -> book()
function bookingBatch(db, uid, overrides = {}) {
  const apptRef = doc(collection(db, "appointments"));
  const batch = writeBatch(db);
  batch.set(apptRef, {
    patient_id: uid, slot_id: SLOT_ID, doctor_id: DOCTOR.id, doctor_name: DOCTOR.full_name, specialty_name: DOCTOR.specialty_name,
    clinic_name: DOCTOR.clinic_name, consultation_fee_minor: DOCTOR.consultation_fee_minor, currency_code: DOCTOR.currency_code,
    doctor_color: DOCTOR.color, starts_at: startsAt, ends_at: endsAt, consultation_type: "in_person", reason_for_visit: null,
    status: "confirmed", created_at: serverTimestamp(), updated_at: serverTimestamp(), ...overrides,
  });
  batch.update(doc(db, "doctors", DOCTOR.id, "slots", SLOT_ID), { is_available: false, appointment_id: apptRef.id, updated_at: serverTimestamp() });
  batch.set(doc(collection(db, "users", uid, "notifications")), {
    type: "appointment", title: "Appointment confirmed", body: "x", icon: "event-available", appointment_id: apptRef.id, read: false, created_at: serverTimestamp(),
  });
  return { batch, apptRef };
}

// Same batch as appointment-service.ts -> cancel()
function cancelBatch(db, uid, apptId) {
  const batch = writeBatch(db);
  batch.update(doc(db, "appointments", apptId), { status: "cancelled", updated_at: serverTimestamp() });
  batch.update(doc(db, "doctors", DOCTOR.id, "slots", SLOT_ID), { is_available: true, appointment_id: null, updated_at: serverTimestamp() });
  batch.set(doc(collection(db, "users", uid, "notifications")), {
    type: "appointment", title: "Appointment cancelled", body: "x", icon: "event-busy", appointment_id: apptId, read: false, created_at: serverTimestamp(),
  });
  return batch;
}

const newProfile = (extra = {}) => ({
  full_name: "Ada", phone: "0801", blood_type: null, allergies: null, avatar_path: null,
  patient_details_completed_at: null, created_at: serverTimestamp(), updated_at: serverTimestamp(), ...extra,
});
const newOwner = (uid, extra = {}) => ({
  uid, email: `${uid}@example.com`, displayName: "Ada", phone: "0801", photoURL: null,
  bloodType: null, allergies: null, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), ...extra,
});

describe("profiles", () => {
  test("a patient can create and read their own profile", async () => {
    const db = dbFor("alice");
    await assertSucceeds(setDoc(doc(db, "users", "alice"), newProfile()));
    await assertSucceeds(getDoc(doc(db, "users", "alice")));
  });
  test("a patient cannot create or read someone else's profile", async () => {
    await assertFails(setDoc(doc(dbFor("alice"), "users", "bob"), newProfile()));
    await env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), "users", "bob"), { full_name: "Bob" }));
    await assertFails(getDoc(doc(dbFor("alice"), "users", "bob")));
  });
  test("profile creation rejects unknown fields and a pre-completed onboarding", async () => {
    const db = dbFor("alice");
    await assertFails(setDoc(doc(db, "users", "alice"), newProfile({ is_admin: true })));
    await assertFails(setDoc(doc(db, "users", "alice"), newProfile({ patient_details_completed_at: Timestamp.now() })));
  });
  test("updates are validated", async () => {
    const db = dbFor("alice");
    await setDoc(doc(db, "users", "alice"), newProfile());
    const ref = doc(db, "users", "alice");
    await assertSucceeds(updateDoc(ref, { blood_type: "O+", allergies: "Peanuts", patient_details_completed_at: Timestamp.now(), updated_at: serverTimestamp() }));
    await assertSucceeds(updateDoc(ref, { avatar_path: "profile-photos/alice/avatar", updated_at: serverTimestamp() }));
    await assertFails(updateDoc(ref, { blood_type: "Z+", updated_at: serverTimestamp() }));
    await assertFails(updateDoc(ref, { avatar_path: "profile-photos/bob/avatar", updated_at: serverTimestamp() }));
    await assertFails(updateDoc(ref, { allergies: "x".repeat(2001), updated_at: serverTimestamp() }));
    await assertFails(updateDoc(ref, { full_name: "Ada" })); // missing updated_at
  });
});

describe("owner records", () => {
  test("a patient can create, read, and update their own owner record", async () => {
    const db = dbFor("alice");
    const ref = doc(db, "owners", "alice");
    await assertSucceeds(setDoc(ref, newOwner("alice")));
    await assertSucceeds(getDoc(ref));
    await assertSucceeds(updateDoc(ref, { phone: "0802", updatedAt: serverTimestamp() }));
  });

  test("owner records cannot be read or written for another patient", async () => {
    await assertFails(setDoc(doc(dbFor("alice"), "owners", "bob"), newOwner("bob")));
    await env.withSecurityRulesDisabled((ctx) =>
      setDoc(doc(ctx.firestore(), "owners", "alice"), newOwner("alice")),
    );
    await assertFails(getDoc(doc(dbFor("bob"), "owners", "alice")));
  });

  test("owner records reject invalid identity and unexpected fields", async () => {
    const db = dbFor("alice");
    await assertFails(setDoc(doc(db, "owners", "alice"), newOwner("bob")));
    await assertFails(setDoc(doc(db, "owners", "alice"), newOwner("alice", { is_admin: true })));
  });
});

describe("notifications", () => {
  test("owner can create, read and mark read; nothing else", async () => {
    const db = dbFor("alice");
    const ref = doc(db, "users", "alice", "notifications", "welcome");
    await assertSucceeds(setDoc(ref, { type: "account", title: "Hi", body: "Welcome", icon: "waving-hand", appointment_id: null, read: false, created_at: serverTimestamp() }));
    await assertSucceeds(updateDoc(ref, { read: true }));
    await assertFails(updateDoc(ref, { title: "Edited" }));
    await assertFails(getDocs(collection(dbFor("bob"), "users", "alice", "notifications")));
  });
});

describe("catalogue", () => {
  test("signed-in patients can read doctors, specialties and slots; nobody can write them", async () => {
    const db = dbFor("alice");
    await assertSucceeds(getDocs(collection(db, "doctors")));
    await assertSucceeds(getDocs(collection(db, "specialties")));
    await assertSucceeds(getDocs(query(collection(db, "doctors", DOCTOR.id, "slots"), where("starts_at", ">", Timestamp.now()))));
    await assertFails(updateDoc(doc(db, "doctors", DOCTOR.id), { consultation_fee_minor: 1 }));
    await assertFails(setDoc(doc(db, "doctors", "new"), { full_name: "Fake" }));
    await assertFails(setDoc(doc(db, "doctors", DOCTOR.id, "slots", "extra"), { starts_at: startsAt, ends_at: endsAt, is_available: true }));
  });
  test("signed-out users can read nothing", async () => {
    await assertFails(getDocs(collection(env.unauthenticatedContext().firestore(), "doctors")));
  });
});

describe("booking", () => {
  test("a patient can book a free slot", async () => {
    const db = dbFor("alice");
    const { batch, apptRef } = bookingBatch(db, "alice");
    await assertSucceeds(batch.commit());
    await assertSucceeds(getDoc(apptRef));
    await assertSucceeds(getDocs(query(collection(db, "appointments"), where("patient_id", "==", "alice"))));
  });

  test("the same slot cannot be booked twice", async () => {
    await assertSucceeds(bookingBatch(dbFor("alice"), "alice").batch.commit());
    await assertFails(bookingBatch(dbFor("bob"), "bob").batch.commit());
  });

  test("a booking cannot be made for another patient", async () => {
    await assertFails(bookingBatch(dbFor("alice"), "alice", { patient_id: "bob" }).batch.commit());
  });

  test("the doctor snapshot must match the catalogue (no fee tampering)", async () => {
    await assertFails(bookingBatch(dbFor("alice"), "alice", { consultation_fee_minor: 1 }).batch.commit());
    await assertFails(bookingBatch(dbFor("alice"), "alice", { doctor_name: "Dr. Someone Else" }).batch.commit());
  });

  test("an appointment without reserving the slot is rejected", async () => {
    const db = dbFor("alice");
    const { apptRef } = bookingBatch(db, "alice");
    const solo = writeBatch(db);
    solo.set(apptRef, { patient_id: "alice", slot_id: SLOT_ID, doctor_id: DOCTOR.id, doctor_name: DOCTOR.full_name, specialty_name: "General", clinic_name: "Test Clinic", consultation_fee_minor: 2500, currency_code: "USD", doctor_color: "#2563EB", starts_at: startsAt, ends_at: endsAt, consultation_type: "in_person", status: "confirmed", created_at: serverTimestamp(), updated_at: serverTimestamp() });
    await assertFails(solo.commit());
  });

  test("a slot cannot be grabbed without an appointment", async () => {
    await assertFails(updateDoc(doc(dbFor("alice"), "doctors", DOCTOR.id, "slots", SLOT_ID), { is_available: false, appointment_id: "fake", updated_at: serverTimestamp() }));
  });

  test("a booking for a doctor who is not bookable is rejected", async () => {
    await env.withSecurityRulesDisabled((ctx) => updateDoc(doc(ctx.firestore(), "doctors", DOCTOR.id), { is_bookable: false }));
    await assertFails(bookingBatch(dbFor("alice"), "alice").batch.commit());
  });
});

describe("cancelling", () => {
  test("a patient can cancel their own appointment, which frees the slot for others", async () => {
    const alice = dbFor("alice");
    const { batch, apptRef } = bookingBatch(alice, "alice");
    await batch.commit();
    await assertSucceeds(cancelBatch(alice, "alice", apptRef.id).commit());
    await assertSucceeds(bookingBatch(dbFor("bob"), "bob").batch.commit());
  });

  test("another patient cannot cancel it or read it", async () => {
    const { batch, apptRef } = bookingBatch(dbFor("alice"), "alice");
    await batch.commit();
    await assertFails(cancelBatch(dbFor("bob"), "bob", apptRef.id).commit());
    await assertFails(getDoc(doc(dbFor("bob"), "appointments", apptRef.id)));
  });

  test("an appointment cannot be edited in any way other than cancelling it", async () => {
    const alice = dbFor("alice");
    const { batch, apptRef } = bookingBatch(alice, "alice");
    await batch.commit();
    await assertFails(updateDoc(apptRef, { consultation_fee_minor: 0, updated_at: serverTimestamp() }));
    await assertFails(updateDoc(apptRef, { status: "completed", updated_at: serverTimestamp() }));
  });

  test("a slot cannot be freed without cancelling its appointment", async () => {
    const alice = dbFor("alice");
    await bookingBatch(alice, "alice").batch.commit();
    await assertFails(updateDoc(doc(alice, "doctors", DOCTOR.id, "slots", SLOT_ID), { is_available: true, appointment_id: null, updated_at: serverTimestamp() }));
  });
});
