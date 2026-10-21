// Pure data for the Firestore seed script (no Firebase imports, so it can be unit-tested anywhere).
// These doctors are SAMPLE DATA for development and demos. Replace them with real clinicians before launch.

export const SPECIALTIES = [
  { id: "general", name: "General", icon: "medical-services" },
  { id: "cardiology", name: "Cardiology", icon: "favorite" },
  { id: "dental", name: "Dental", icon: "sentiment-satisfied" },
  { id: "pediatrics", name: "Pediatrics", icon: "child-care" },
  { id: "eye-care", name: "Eye Care", icon: "visibility" },
  { id: "neurology", name: "Neurology", icon: "psychology" },
  { id: "dermatology", name: "Dermatology", icon: "face" },
  { id: "ortho", name: "Ortho", icon: "accessibility-new" },
];

const doc = (id, full_name, specialty_id, clinic_name, rating, review_count, years_experience, fee, color, biography, is_bookable = true) => ({
  id,
  full_name,
  specialty_id,
  clinic_name,
  rating,
  review_count,
  years_experience,
  consultation_fee_minor: fee * 100,
  currency_code: "USD",
  biography,
  is_bookable,
  color,
});

export const DOCTORS = [
  doc("dr-amara-okafor", "Dr. Amara Okafor", "cardiology", "Lagoon Heart Centre", 4.9, 312, 14, 45, "#2563EB",
    "Consultant cardiologist focused on preventive heart care, hypertension and post-cardiac rehabilitation."),
  doc("dr-daniel-mensah", "Dr. Daniel Mensah", "general", "CityCare Clinic", 4.8, 540, 9, 25, "#0EA5E9",
    "Family physician helping patients with everyday illness, chronic conditions and routine check-ups."),
  doc("dr-zainab-bello", "Dr. Zainab Bello", "pediatrics", "Little Steps Hospital", 4.9, 288, 11, 35, "#6366F1",
    "Paediatrician caring for infants, children and teens, with a special interest in child nutrition and vaccines."),
  doc("dr-chidi-eze", "Dr. Chidi Eze", "dental", "BrightSmile Dental", 4.7, 201, 8, 30, "#14B8A6",
    "Dental surgeon offering cleaning, restorative care and cosmetic dentistry in a calm, friendly setting.", false),
  doc("dr-ifeoma-adeyemi", "Dr. Ifeoma Adeyemi", "dermatology", "ClearSkin Studio", 4.8, 175, 10, 40, "#3B82F6",
    "Dermatologist treating acne, eczema, pigmentation and hair loss with evidence-based care."),
  doc("dr-tunde-balogun", "Dr. Tunde Balogun", "ortho", "MoveWell Ortho Hospital", 4.6, 143, 16, 50, "#0284C7",
    "Orthopaedic specialist for joint pain, sports injuries and mobility recovery."),
  doc("dr-ngozi-umeh", "Dr. Ngozi Umeh", "eye-care", "Clearview Eye Clinic", 4.8, 162, 12, 40, "#0891B2",
    "Ophthalmologist for eye tests, glaucoma screening, cataract care and dry-eye treatment."),
  doc("dr-samuel-adeleke", "Dr. Samuel Adeleke", "neurology", "NeuroCare Institute", 4.7, 118, 15, 55, "#4F46E5",
    "Neurologist treating migraines, epilepsy, nerve pain and sleep disorders."),
  doc("dr-halima-yusuf", "Dr. Halima Yusuf", "general", "Greenfield Family Clinic", 4.9, 396, 7, 25, "#0D9488",
    "General practitioner offering same-week appointments for check-ups, women's health and chronic disease care."),
  doc("dr-emeka-obi", "Dr. Emeka Obi", "dental", "Smile Studio Lekki", 4.6, 97, 6, 30, "#1D4ED8",
    "Dentist focused on routine check-ups, fillings, braces consultations and whitening."),
];

// Clinic hours in clinic-local time. 30-minute slots, Monday to Saturday, with a lunch break.
export const SLOT_TIMES = [
  [9, 0], [9, 30], [10, 0], [10, 30], [11, 0], [11, 30],
  [13, 0], [13, 30], [14, 0], [14, 30], [15, 0], [15, 30], [16, 0], [16, 30],
];
export const SLOT_MINUTES = 30;

const pad = (n) => String(n).padStart(2, "0");

/**
 * Builds the bookable slots for the next `days` days.
 * `utcOffsetHours` is the clinic's offset from UTC (Lagos is +1 and has no daylight saving).
 * Slots earlier than `minLeadHours` from now are skipped. Ids are deterministic (YYYYMMDD-HHmm, clinic time),
 * so re-running the seed never duplicates a slot.
 */
export function buildSlots({ now = new Date(), days = 14, utcOffsetHours = 1, minLeadHours = 2 } = {}) {
  const earliest = now.getTime() + minLeadHours * 3600_000;
  const local = new Date(now.getTime() + utcOffsetHours * 3600_000); // shifted so UTC getters give clinic-local fields
  const slots = [];
  for (let i = 0; i < days; i++) {
    const day = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + i));
    if (day.getUTCDay() === 0) continue; // Sunday closed
    for (const [h, m] of SLOT_TIMES) {
      const startMs = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), h - utcOffsetHours, m);
      if (startMs < earliest) continue;
      slots.push({
        id: `${day.getUTCFullYear()}${pad(day.getUTCMonth() + 1)}${pad(day.getUTCDate())}-${pad(h)}${pad(m)}`,
        startsAt: new Date(startMs),
        endsAt: new Date(startMs + SLOT_MINUTES * 60_000),
      });
    }
  }
  return slots;
}

export function buildCatalog(options = {}) {
  const specialties = SPECIALTIES;
  const byId = new Map(specialties.map((s) => [s.id, s]));
  const doctors = DOCTORS.map((d) => {
    const spec = byId.get(d.specialty_id);
    if (!spec) throw new Error(`Doctor ${d.id} references unknown specialty ${d.specialty_id}`);
    return { ...d, specialty_name: spec.name };
  });
  const slots = buildSlots(options);
  return { specialties, doctors, slots };
}
