import { getDb } from "@/lib/firebase";
import { toIso } from "@/lib/firestore-utils";
import type { AppNotification, NotificationIcon } from "@/types/models";
import { collection, doc, limit, onSnapshot, orderBy, query, updateDoc, writeBatch, type DocumentData } from "firebase/firestore";

const ICONS: NotificationIcon[] = ["event-available", "event-busy", "waving-hand", "info"];

function toNotification(id: string, d: DocumentData): AppNotification {
  return {
    id,
    type: d.type === "appointment" ? "appointment" : "account",
    title: d.title ?? "",
    body: d.body ?? "",
    icon: ICONS.includes(d.icon) ? d.icon : "info",
    appointment_id: d.appointment_id ?? null,
    read: d.read === true,
    created_at: toIso(d.created_at) ?? new Date().toISOString(),
  };
}

export const notificationService = {
  subscribeMine(uid: string, onData: (items: AppNotification[]) => void, onError: (error: Error) => void) {
    const q = query(collection(getDb(), "users", uid, "notifications"), orderBy("created_at", "desc"), limit(50));
    return onSnapshot(
      q,
      (snap) => onData(snap.docs.map((d) => toNotification(d.id, d.data({ serverTimestamps: "estimate" })))),
      onError,
    );
  },

  async markRead(uid: string, id: string) {
    await updateDoc(doc(getDb(), "users", uid, "notifications", id), { read: true });
  },

  async markAllRead(uid: string, ids: string[]) {
    if (!ids.length) return;
    const db = getDb();
    const batch = writeBatch(db);
    ids.slice(0, 400).forEach((id) => batch.update(doc(db, "users", uid, "notifications", id), { read: true }));
    await batch.commit();
  },
};
