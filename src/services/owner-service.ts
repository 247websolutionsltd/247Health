import { getDb } from "@/lib/firebase";
import { profileService, type ProfileSeed } from "@/services/profile-service";
import type { Profile } from "@/types/models";
import type { User } from "firebase/auth";
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc, type Unsubscribe } from "firebase/firestore";

export type OwnerRecord = {
  uid: string;
  email: string | null;
  displayName: string;
  phone: string | null;
  photoURL: string | null;
  bloodType: string | null;
  allergies: string | null;
};

type OwnerDocument = OwnerRecord & {
  createdAt?: unknown;
  updatedAt?: unknown;
};

const ownerRef = (uid: string) => doc(getDb(), "owners", uid);

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function mapOwner(uid: string, data: Record<string, unknown>): OwnerRecord {
  return {
    uid,
    email: optionalString(data.email),
    displayName: optionalString(data.displayName) ?? "Patient",
    phone: optionalString(data.phone),
    photoURL: optionalString(data.photoURL),
    bloodType: optionalString(data.bloodType),
    allergies: optionalString(data.allergies),
  };
}

function ownerData(
  user: User,
  profile: Profile,
  existing: Partial<OwnerDocument>,
  seed: ProfileSeed,
  legacy: Partial<OwnerRecord>,
): OwnerRecord {
  return {
    uid: user.uid,
    email: user.email ?? optionalString(existing.email) ?? legacy.email ?? null,
    displayName:
      profile.full_name?.trim() ||
      user.displayName?.trim() ||
      optionalString(existing.displayName) ||
      legacy.displayName ||
      user.email?.split("@")[0] ||
      "Patient",
    phone:
      profile.phone?.trim() ||
      seed.phone?.trim() ||
      optionalString(existing.phone) ||
      legacy.phone ||
      user.phoneNumber ||
      null,
    photoURL: user.photoURL ?? optionalString(existing.photoURL) ?? legacy.photoURL ?? null,
    bloodType: profile.blood_type ?? optionalString(existing.bloodType) ?? legacy.bloodType ?? null,
    allergies: profile.allergies ?? optionalString(existing.allergies) ?? legacy.allergies ?? null,
  };
}

/**
 * Creates or migrates the canonical owner document from Firebase Auth and the existing
 * users/{uid} patient profile. Safe to run on every sign-in.
 */
export async function ensureOwnerRecord(
  user: User,
  seed: ProfileSeed = {},
  legacy: Partial<OwnerRecord> = {},
): Promise<OwnerRecord> {
  const profile = await profileService.getMine(user.uid, seed);
  const ref = ownerRef(user.uid);
  const existingSnapshot = await getDoc(ref);
  const existing = existingSnapshot.exists()
    ? (existingSnapshot.data() as Partial<OwnerDocument>)
    : {};
  const owner = ownerData(user, profile, existing, seed, legacy);

  await setDoc(
    ref,
    {
      ...owner,
      ...(!existingSnapshot.exists() ? { createdAt: serverTimestamp() } : {}),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return owner;
}

export function subscribeOwner(
  uid: string,
  onData: (owner: OwnerRecord | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    ownerRef(uid),
    (snapshot) => onData(snapshot.exists() ? mapOwner(snapshot.id, snapshot.data()) : null),
    onError,
  );
}
