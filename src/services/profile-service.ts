import { getDb, getFirebaseStorage } from "@/lib/firebase";
import { AppError } from "@/lib/errors";
import { toIso } from "@/lib/firestore-utils";
import type { Profile } from "@/types/models";
import { File } from "expo-file-system";
import { doc, getDoc, serverTimestamp, setDoc, Timestamp, updateDoc, writeBatch, type DocumentData } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Platform } from "react-native";

export type ProfileUpdate = Partial<Pick<Profile, "full_name" | "phone" | "blood_type" | "allergies" | "patient_details_completed_at">>;
export type ProfileSeed = { full_name?: string | null; phone?: string | null };

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];
const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // matches firebase/storage.rules

export const avatarPathFor = (uid: string) => `profile-photos/${uid}/avatar`;

function toProfile(id: string, d: DocumentData): Profile {
  const now = new Date().toISOString();
  return {
    id,
    full_name: d.full_name ?? null,
    phone: d.phone ?? null,
    blood_type: d.blood_type ?? null,
    allergies: d.allergies ?? null,
    avatar_path: d.avatar_path ?? null,
    patient_details_completed_at: toIso(d.patient_details_completed_at),
    created_at: toIso(d.created_at) ?? now,
    updated_at: toIso(d.updated_at) ?? now,
  };
}

async function readImageBytes(uri: string): Promise<ArrayBuffer> {
  if (Platform.OS !== "web") {
    const file = new File(uri);
    if (!file.exists) throw new AppError("The selected image is no longer available. Choose it again.");
    return file.arrayBuffer();
  }
  const response = await fetch(uri);
  if (!response.ok) throw new AppError("Could not read the selected image. Choose it again.");
  return response.arrayBuffer();
}

async function readProfile(uid: string): Promise<Profile | null> {
  const snap = await getDoc(doc(getDb(), "users", uid));
  return snap.exists() ? toProfile(snap.id, snap.data({ serverTimestamps: "estimate" })) : null;
}

export const profileService = {
  /**
   * Returns the patient's profile, creating it (plus a welcome notification) the first time they sign in.
   * `seed` carries the name/phone typed on the sign-up form, which Firebase Auth doesn't store.
   */
  async getMine(uid: string, seed: ProfileSeed = {}): Promise<Profile> {
    const existing = await readProfile(uid);
    if (existing) return existing;

    const db = getDb();
    const batch = writeBatch(db);
    batch.set(doc(db, "users", uid), {
      full_name: seed.full_name?.trim() || null,
      phone: seed.phone?.trim() || null,
      blood_type: null,
      allergies: null,
      avatar_path: null,
      patient_details_completed_at: null,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    batch.set(doc(db, "users", uid, "notifications", "welcome"), {
      type: "account",
      title: "Welcome to CareNest",
      body: "Your patient account is ready. Find a doctor and book your first appointment.",
      icon: "waving-hand",
      appointment_id: null,
      read: false,
      created_at: serverTimestamp(),
    });
    try {
      await batch.commit();
    } catch (error) {
      // Another device may have created it a moment ago; a second read settles that.
      const raced = await readProfile(uid);
      if (raced) return raced;
      throw error;
    }
    const created = await readProfile(uid);
    if (!created) throw new AppError("Could not create your patient profile. Please try again.");
    return created;
  },

  async updateMine(uid: string, update: ProfileUpdate): Promise<Profile> {
    // Mirror the limits in firebase/firestore.rules so an over-long value gets a clear message
    // instead of a generic "permission denied".
    if ((update.full_name?.trim().length ?? 0) > 120) throw new AppError("Your name can be at most 120 characters.");
    if ((update.phone?.trim().length ?? 0) > 32) throw new AppError("Your phone number can be at most 32 characters.");
    if ((update.allergies?.trim().length ?? 0) > 2000) throw new AppError("Allergies can be at most 2000 characters.");
    if (update.blood_type && !BLOOD_TYPES.includes(update.blood_type)) throw new AppError("Choose a valid blood type.");

    const data: Record<string, unknown> = { updated_at: serverTimestamp() };
    if (update.full_name !== undefined) data.full_name = update.full_name?.trim() || null;
    if (update.phone !== undefined) data.phone = update.phone?.trim() || null;
    if (update.blood_type !== undefined) data.blood_type = update.blood_type || null;
    if (update.allergies !== undefined) data.allergies = update.allergies?.trim() || null;
    if (update.patient_details_completed_at !== undefined) {
      data.patient_details_completed_at = update.patient_details_completed_at
        ? Timestamp.fromDate(new Date(update.patient_details_completed_at))
        : null;
    }
    await updateDoc(doc(getDb(), "users", uid), data);
    const fresh = await readProfile(uid);
    if (!fresh) throw new AppError("We couldn't find your profile after saving. Please try again.");
    return fresh;
  },

  async uploadAvatar(uid: string, uri: string, contentType = "image/jpeg") {
    const body = await readImageBytes(uri);
    if (body.byteLength > MAX_PHOTO_BYTES) throw new AppError("That photo is larger than 5 MB. Choose a smaller one.");
    const path = avatarPathFor(uid);
    await uploadBytes(ref(getFirebaseStorage(), path), body, { contentType });
    await updateDoc(doc(getDb(), "users", uid), { avatar_path: path, updated_at: serverTimestamp() });
    const profile = await readProfile(uid);
    if (!profile) throw new AppError("We couldn't find your profile after saving. Please try again.");
    return { profile, avatarUrl: await profileService.getAvatarUrl(path, profile.updated_at) };
  },

  /** The photo always lives at the same path, so `version` busts the image cache when it changes. */
  async getAvatarUrl(path: string, version?: string) {
    const url = await getDownloadURL(ref(getFirebaseStorage(), path));
    return version ? `${url}${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(version)}` : url;
  },
};
