import { Timestamp } from "firebase/firestore";

/** Firestore Timestamp | Date | ISO string | null -> ISO string (or null). */
export function toIso(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  // A pending serverTimestamp() resolves to null/estimate on local snapshots; treat anything else as unknown.
  return null;
}

export function toTimestamp(iso: string): Timestamp {
  return Timestamp.fromDate(new Date(iso));
}
