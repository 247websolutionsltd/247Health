import { getSupabaseClient } from "@/lib/supabase";
import type { Doctor, DoctorSlot, Specialty } from "@/types/database.types";

export const catalogService = {
  async listSpecialties(): Promise<Specialty[]> {
    const { data, error } = await getSupabaseClient().from("specialties").select("*").order("name");
    if (error) throw error;
    return data;
  },

  async listDoctors(filters: { specialtyId?: string; search?: string } = {}): Promise<Doctor[]> {
    let query = getSupabaseClient().from("doctors").select("*").order("full_name");
    if (filters.specialtyId) query = query.eq("specialty_id", filters.specialtyId);
    if (filters.search?.trim()) query = query.ilike("full_name", `%${filters.search.trim()}%`);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async listOpenSlots(doctorId: string): Promise<DoctorSlot[]> {
    const { data, error } = await getSupabaseClient()
      .from("doctor_slots")
      .select("*")
      .eq("doctor_id", doctorId)
      .eq("is_available", true)
      .gt("starts_at", new Date().toISOString())
      .order("starts_at");
    if (error) throw error;
    return data;
  },
};