#!/usr/bin/env node
// Seeds Firestore with the catalogue (specialties, doctors) and bookable time slots.
//
//   npm i -D firebase-admin
//   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json   # Firebase console > Project settings > Service accounts
//   node scripts/seed-firestore.mjs --project <firebase-project-id>
//
// Options:  --days 14        how many days of slots to generate (default 14)
//           --offset 1       clinic UTC offset in hours (default 1 = Lagos)
//           --dry-run        print what would be written; needs no credentials or firebase-admin
//
// Safe to re-run: specialties/doctors are merged; slots use fixed ids and are created only if missing, so a
// slot a patient has already booked is never overwritten. Run it again any time to extend the booking window.
import { buildCatalog } from "./seed-data.mjs";

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const value = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const days = Number(value("days", 14));
const offset = Number(value("offset", 1));
if (!Number.isInteger(days) || days < 1 || days > 90) throw new Error("--days must be a whole number between 1 and 90");
if (!Number.isFinite(offset) || offset < -12 || offset > 14) throw new Error("--offset must be a UTC offset in hours");

const { specialties, doctors, slots } = buildCatalog({ days, utcOffsetHours: offset });
const bookable = doctors.filter((d) => d.is_bookable);
const totalSlots = bookable.length * slots.length;

console.log(`Specialties: ${specialties.length}`);
console.log(`Doctors:     ${doctors.length} (${bookable.length} bookable)`);
console.log(`Slots:       ${slots.length} per bookable doctor x ${bookable.length} = ${totalSlots} over ${days} days`);

if (flag("dry-run")) {
  console.log("\nDry run: nothing written. First slot:", slots[0]?.id, slots[0]?.startsAt.toISOString());
  process.exit(0);
}

const projectId = value("project", process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID);
if (!projectId) throw new Error("Pass --project <firebase-project-id> (or set EXPO_PUBLIC_FIREBASE_PROJECT_ID).");
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.FIRESTORE_EMULATOR_HOST) {
  throw new Error("Set GOOGLE_APPLICATION_CREDENTIALS to a service-account JSON path (or FIRESTORE_EMULATOR_HOST to use the emulator).");
}

const { initializeApp, applicationDefault } = await import("firebase-admin/app");
const { getFirestore, Timestamp } = await import("firebase-admin/firestore");

initializeApp({ credential: applicationDefault(), projectId });
const db = getFirestore();
const writer = db.bulkWriter();

let created = 0;
let skipped = 0;
// ALREADY_EXISTS (gRPC code 6) on a slot is expected on re-runs: leave the existing slot untouched.
writer.onWriteError((error) => {
  if (error.code === 6) return false;
  return error.failedAttempts < 5;
});

for (const s of specialties) {
  const { id, ...data } = s;
  writer.set(db.collection("specialties").doc(id), data, { merge: true });
}
for (const d of doctors) {
  const { id, ...data } = d;
  writer.set(db.collection("doctors").doc(id), data, { merge: true });
}

const now = Timestamp.now();
for (const d of bookable) {
  for (const s of slots) {
    writer
      .create(db.collection("doctors").doc(d.id).collection("slots").doc(s.id), {
        starts_at: Timestamp.fromDate(s.startsAt),
        ends_at: Timestamp.fromDate(s.endsAt),
        is_available: true,
        appointment_id: null,
        updated_at: now,
      })
      .then(() => { created++; })
      .catch((error) => {
        if (error.code === 6) skipped++;
        else console.error(`Failed to write slot ${d.id}/${s.id}:`, error.message);
      });
  }
}

await writer.close();
console.log(`\nDone. Slots created: ${created}, already existed: ${skipped}.`);
