import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type DocumentSnapshot,
  type Unsubscribe
} from "firebase/firestore";

import type { User } from "firebase/auth";
import { db } from "../config/firebase";

export type UserProfile = {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  phone?: string;
};

export const DEFAULT_TIER = "Tier 1 · Basic";

export const userRef = (uid: string) => doc(db, "users", uid);

/* ------------------------------ generators ------------------------------- */

const digits = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");

// NOTE: random, not guaranteed unique. Issue real account numbers from a server in production.
export const generateAccountNumber = () => "70" + digits(8);

export function generateReferralCode(name?: string | null) {
  const letters = (name ?? "").replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 3).padEnd(3, "V");
  return letters + digits(4);
}

/* -------------------------------- mapping -------------------------------- */

const toNumber = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
};

export function toProfile(snap: DocumentSnapshot): UserProfile | null {
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    uid: snap.id,
    email: d.email,
    displayName: d.displayName,
    photoURL: d.photoURL,
    phone: d.phone ?? d.phoneNumber ?? "",
  };
}

/* ------------------------------ operations ------------------------------- */

/**
 * Idempotent: creates the account document for a new user (balance 0, account number,
 * referral code, welcome notifications) and repairs documents from older app versions
 * (string balances, missing account number...). Safe to call on every sign-in.
 */
export async function ensureUserAccount(
  user: User,
  extra: { displayName?: string; phone?: string } = {},
): Promise<void> {
  const ref = userRef(user.uid);
  const displayName = extra.displayName?.trim() || user.displayName || undefined;
}

export function subscribeUserProfile(
  uid: string,
  onData: (profile: UserProfile | null) => void,
  onError: (error: unknown) => void,
): Unsubscribe {
  return onSnapshot(userRef(uid), (snap) => onData(toProfile(snap)), onError);
}

/** Only fields a customer may change directly. Balance is never written from here. */
export async function updateUserProfile(
  uid: string,
  patch: Partial<Pick<UserProfile, "displayName" | "phone" >>,
) {
  await setDoc(userRef(uid), { ...patch, updatedAt: serverTimestamp() }, { merge: true });
}
