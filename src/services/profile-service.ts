import { getSupabaseClient } from "@/lib/supabase";
import type { Profile } from "@/types/database.types";
import type { User } from "@supabase/supabase-js";
import { File } from "expo-file-system";
import { Platform } from "react-native";

export type ProfileUpdate = Partial<Pick<Profile, "full_name" | "phone" | "blood_type" | "allergies" | "patient_details_completed_at">>;

const PROFILE_PHOTO_BUCKET = "profile-photos";
const PROFILE_SCHEMA_ERROR = "The Supabase profile schema is not deployed. Apply the SQL migrations in supabase/migrations, then retry.";

async function readImageBytes(uri: string): Promise<ArrayBuffer> {
  if (Platform.OS !== "web") {
    const file = new File(uri);
    if (!file.exists) throw new Error("The selected image is no longer available. Choose it again.");
    return file.arrayBuffer();
  }

  const response = await fetch(uri);
  if (!response.ok) throw new Error("Could not read the selected image. Choose it again.");
  return response.arrayBuffer();
}

function throwProfileError(error: { code?: string; message: string }): never {
  if (["PGRST205", "PGRST204", "42P01", "42703"].includes(error.code ?? "")) {
    throw new Error(PROFILE_SCHEMA_ERROR);
  }
  throw error;
}

export const profileService = {
  async getMine(user: User) {
    const client = getSupabaseClient();
    const { data, error } = await client.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (error) throwProfileError(error);
    if (data) return data;

    const { data: createdProfile, error: insertError } = await client
      .from("profiles")
      .insert({
        id: user.id,
        full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
        phone: user.phone ?? user.user_metadata?.phone ?? null,
      })
      .select("*")
      .maybeSingle();
    if (insertError?.code === "23505") {
      const { data: racedProfile, error: readError } = await client
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (readError) throwProfileError(readError);
      return racedProfile;
    }
    if (insertError) throwProfileError(insertError);
    if (!createdProfile) throw new Error("Could not create your patient profile.");
    return createdProfile;
  },

  async updateMine(userId: string, update: ProfileUpdate) {
    const { data, error } = await getSupabaseClient()
      .from("profiles")
      .update(update)
      .eq("id", userId)
      .select("*")
      .single();
    if (error) throwProfileError(error);
    return data;
  },

  async uploadAvatar(userId: string, uri: string, contentType = "image/jpeg") {
    const client = getSupabaseClient();
    const body = await readImageBytes(uri);
    const path = `${userId}/avatar`;
    const { error: uploadError } = await client.storage
      .from(PROFILE_PHOTO_BUCKET)
      .upload(path, body, { contentType, upsert: true });
    if (uploadError) throw uploadError;

    const { data: profile, error: profileError } = await client
      .from("profiles")
      .update({ avatar_path: path })
      .eq("id", userId)
      .select("*")
      .single();
    if (profileError) throw profileError;

    const { data: signedUrl, error: urlError } = await client.storage
      .from(PROFILE_PHOTO_BUCKET)
      .createSignedUrl(path, 7 * 24 * 60 * 60);
    if (urlError) throw urlError;
    return { profile, avatarUrl: signedUrl.signedUrl };
  },

  async getAvatarUrl(path: string) {
    const { data, error } = await getSupabaseClient().storage
      .from(PROFILE_PHOTO_BUCKET)
      .createSignedUrl(path, 7 * 24 * 60 * 60);
    if (error) throw error;
    return data.signedUrl;
  },
};