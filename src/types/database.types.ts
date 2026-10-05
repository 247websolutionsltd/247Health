export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; full_name: string | null; phone: string | null; blood_type: string | null; allergies: string | null; avatar_path: string | null; patient_details_completed_at: string | null; created_at: string; updated_at: string };
        Insert: { id: string; full_name?: string | null; phone?: string | null; blood_type?: string | null; allergies?: string | null; avatar_path?: string | null; patient_details_completed_at?: string | null; created_at?: string; updated_at?: string };
        Update: { id?: string; full_name?: string | null; phone?: string | null; blood_type?: string | null; allergies?: string | null; avatar_path?: string | null; patient_details_completed_at?: string | null; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      specialties: {
        Row: { id: string; slug: string; name: string; created_at: string; updated_at: string };
        Insert: { id?: string; slug: string; name: string; created_at?: string; updated_at?: string };
        Update: { id?: string; slug?: string; name?: string; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      doctors: {
        Row: { id: string; specialty_id: string; full_name: string; clinic_name: string; rating: number; review_count: number; years_experience: number; consultation_fee_minor: number; currency_code: string; biography: string; is_bookable: boolean; created_at: string; updated_at: string };
        Insert: { id?: string; specialty_id: string; full_name: string; clinic_name: string; rating?: number; review_count?: number; years_experience?: number; consultation_fee_minor: number; currency_code: string; biography?: string; is_bookable?: boolean; created_at?: string; updated_at?: string };
        Update: { id?: string; specialty_id?: string; full_name?: string; clinic_name?: string; rating?: number; review_count?: number; years_experience?: number; consultation_fee_minor?: number; currency_code?: string; biography?: string; is_bookable?: boolean; created_at?: string; updated_at?: string };
        Relationships: [{ foreignKeyName: "doctors_specialty_id_fkey"; columns: ["specialty_id"]; isOneToOne: false; referencedRelation: "specialties"; referencedColumns: ["id"] }];
      };
      doctor_slots: {
        Row: { id: string; doctor_id: string; starts_at: string; ends_at: string; is_available: boolean; created_at: string; updated_at: string };
        Insert: { id?: string; doctor_id: string; starts_at: string; ends_at: string; is_available?: boolean; created_at?: string; updated_at?: string };
        Update: { id?: string; doctor_id?: string; starts_at?: string; ends_at?: string; is_available?: boolean; created_at?: string; updated_at?: string };
        Relationships: [{ foreignKeyName: "doctor_slots_doctor_id_fkey"; columns: ["doctor_id"]; isOneToOne: false; referencedRelation: "doctors"; referencedColumns: ["id"] }];
      };
      appointments: {
        Row: { id: string; patient_id: string; slot_id: string; consultation_type: Database["public"]["Enums"]["consultation_type"]; reason_for_visit: string | null; status: Database["public"]["Enums"]["appointment_status"]; created_at: string; updated_at: string };
        Insert: { id?: string; patient_id: string; slot_id: string; consultation_type: Database["public"]["Enums"]["consultation_type"]; reason_for_visit?: string | null; status?: Database["public"]["Enums"]["appointment_status"]; created_at?: string; updated_at?: string };
        Update: { id?: string; patient_id?: string; slot_id?: string; consultation_type?: Database["public"]["Enums"]["consultation_type"]; reason_for_visit?: string | null; status?: Database["public"]["Enums"]["appointment_status"]; created_at?: string; updated_at?: string };
        Relationships: [{ foreignKeyName: "appointments_slot_id_fkey"; columns: ["slot_id"]; isOneToOne: false; referencedRelation: "doctor_slots"; referencedColumns: ["id"] }];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      consultation_type: "in_person" | "video_call";
      appointment_status: "confirmed" | "completed" | "cancelled";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Doctor = Database["public"]["Tables"]["doctors"]["Row"];
export type Specialty = Database["public"]["Tables"]["specialties"]["Row"];
export type DoctorSlot = Database["public"]["Tables"]["doctor_slots"]["Row"];
export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];