// App-level models. Firestore documents are mapped to these in services/* (Timestamps become ISO strings).

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  blood_type: string | null;
  allergies: string | null;
  avatar_path: string | null;
  patient_details_completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Specialty = {
  id: string;
  name: string;
  icon: string; // a MaterialIcons name
};

export type Doctor = {
  id: string;
  full_name: string;
  specialty_id: string;
  specialty_name: string;
  clinic_name: string;
  rating: number;
  review_count: number;
  years_experience: number;
  consultation_fee_minor: number; // minor units, e.g. cents
  currency_code: string; // ISO 4217
  biography: string;
  is_bookable: boolean;
  color: string; // avatar colour
};

export type DoctorSlot = {
  id: string;
  doctor_id: string;
  starts_at: string;
  ends_at: string;
  is_available: boolean;
  appointment_id: string | null; // set while booked; deliberately holds no patient identity (slots are readable by all patients)
};

export type ConsultationType = "in_person" | "video_call";
export type AppointmentStatus = "confirmed" | "completed" | "cancelled";

export type Appointment = {
  id: string;
  patient_id: string;
  slot_id: string;
  doctor_id: string;
  // Snapshot of the doctor at booking time, so history never depends on later catalogue edits.
  doctor_name: string;
  specialty_name: string;
  clinic_name: string;
  consultation_fee_minor: number;
  currency_code: string;
  doctor_color: string;
  starts_at: string;
  ends_at: string;
  consultation_type: ConsultationType;
  reason_for_visit: string | null;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
};

export type NotificationIcon = "event-available" | "event-busy" | "waving-hand" | "info";

export type AppNotification = {
  id: string;
  type: "appointment" | "account";
  title: string;
  body: string;
  icon: NotificationIcon;
  appointment_id: string | null;
  read: boolean;
  created_at: string;
};
