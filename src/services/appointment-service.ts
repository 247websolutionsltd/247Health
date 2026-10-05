import { getSupabaseClient } from "@/lib/supabase";
import type { Appointment } from "@/types/database.types";

export type NewAppointment = Pick<Appointment, "slot_id" | "consultation_type" | "reason_for_visit">;

export const appointmentService = {
  async listMine(status?: Appointment["status"]): Promise<Appointment[]> {
    let query = getSupabaseClient().from("appointments").select("*").order("created_at", { ascending: false });
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async create(input: NewAppointment): Promise<Appointment> {
    const { data: userData, error: userError } = await getSupabaseClient().auth.getUser();
    if (userError) throw userError;
    if (!userData.user) throw new Error("Sign in to book an appointment.");

    const { data, error } = await getSupabaseClient()
      .from("appointments")
      .insert({ ...input, patient_id: userData.user.id })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async cancel(id: string): Promise<Appointment> {
    const { data, error } = await getSupabaseClient()
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", id)
      .eq("status", "confirmed")
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },
};