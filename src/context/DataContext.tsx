import { useAuth } from "@/context/PageContext";
import { friendlyError } from "@/lib/errors";
import { appointmentService, type BookInput } from "@/services/appointment-service";
import { catalogService } from "@/services/catalog-service";
import { notificationService } from "@/services/notification-service";
import type { Appointment, AppNotification, Doctor, Specialty } from "@/types/models";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

const EMPTY_SPECIALTIES: Specialty[] = [];
const EMPTY_DOCTORS: Doctor[] = [];
const EMPTY_APPOINTMENTS: Appointment[] = [];
const EMPTY_NOTIFICATIONS: AppNotification[] = [];

/* ---------- Catalog (specialties + doctors) ---------- */

type CatalogValue = {
  specialties: Specialty[];
  doctors: Doctor[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  getDoctor: (id: string | undefined) => Doctor | undefined;
};
const CatalogContext = createContext<CatalogValue | undefined>(undefined);

function CatalogProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const uid = user?.id ?? null;
  const [catalog, setCatalog] = useState<{
    uid: string;
    specialties: Specialty[];
    doctors: Doctor[];
    error: string | null;
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const requestId = useRef(0);

  const load = useCallback(async (targetUid: string) => {
    const currentRequest = ++requestId.current;
    try {
      const [s, d] = await Promise.all([catalogService.listSpecialties(), catalogService.listDoctors()]);
      if (currentRequest === requestId.current) setCatalog({ uid: targetUid, specialties: s, doctors: d, error: null });
    } catch (caught) {
      if (currentRequest === requestId.current) {
        setCatalog((current) => ({
          uid: targetUid,
          specialties: current?.uid === targetUid ? current.specialties : EMPTY_SPECIALTIES,
          doctors: current?.uid === targetUid ? current.doctors : EMPTY_DOCTORS,
          error: friendlyError(caught, "Could not load doctors."),
        }));
      }
    }
  }, []);

  useEffect(() => {
    if (!uid) return;
    void load(uid);
  }, [uid, load]);

  const reload = useCallback(async () => {
    if (!uid) return;
    setRefreshing(true);
    try {
      await load(uid);
    } finally {
      setRefreshing(false);
    }
  }, [uid, load]);
  const visibleCatalog = catalog?.uid === uid ? catalog : null;
  const specialties = uid ? visibleCatalog?.specialties ?? EMPTY_SPECIALTIES : EMPTY_SPECIALTIES;
  const doctors = uid ? visibleCatalog?.doctors ?? EMPTY_DOCTORS : EMPTY_DOCTORS;
  const loading = Boolean(uid && !visibleCatalog) || refreshing;
  const error = visibleCatalog?.error ?? null;

  const value = useMemo<CatalogValue>(
    () => ({
      specialties,
      doctors,
      loading,
      error,
      reload,
      getDoctor: (id) => (uid ? doctors.find((d) => d.id === id) : undefined),
    }),
    [uid, specialties, doctors, loading, error, reload],
  );
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside DataProvider");
  return ctx;
}

/* ---------- Appointments (live) ---------- */

export type DisplayStatus = "upcoming" | "completed" | "cancelled";

/** A confirmed visit whose end time has passed counts as completed (there is no clinician-side app yet). */
export function displayStatus(a: Appointment, now: number): DisplayStatus {
  if (a.status === "cancelled") return "cancelled";
  if (a.status === "completed" || new Date(a.ends_at).getTime() <= now) return "completed";
  return "upcoming";
}

type AppointmentsValue = {
  appointments: Appointment[];
  nextAppointment: Appointment | null;
  now: number;
  loading: boolean;
  error: string | null;
  book: (input: BookInput) => Promise<Appointment>;
  cancel: (appointment: Appointment) => Promise<void>;
  getAppointment: (id: string | undefined) => Appointment | undefined;
};
const AppointmentsContext = createContext<AppointmentsValue | undefined>(undefined);

function AppointmentsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const uid = user?.id ?? null;
  const [snapshot, setSnapshot] = useState<{ uid: string; items: Appointment[] } | null>(null);
  const [subscription, setSubscription] = useState<{ uid: string; loading: boolean; error: string | null } | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!uid) return;
    let active = true;
    const unsubscribe = appointmentService.subscribeMine(
      uid,
      (items) => {
        if (!active) return;
        setSnapshot({ uid, items });
        setSubscription({ uid, loading: false, error: null });
      },
      (caught) => {
        if (!active) return;
        setSubscription({ uid, loading: false, error: friendlyError(caught, "Could not load your appointments.") });
      },
    );
    return () => {
      active = false;
      unsubscribe();
    };
  }, [uid]);

  useEffect(() => {
    const initial = setTimeout(() => setNow(Date.now()), 0);
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, []);

  const appointments = snapshot?.uid === uid ? snapshot.items : EMPTY_APPOINTMENTS;
  const loading = uid !== null && subscription?.uid !== uid ? true : (subscription?.loading ?? false);
  const error = subscription?.uid === uid ? subscription.error : null;

  const value = useMemo<AppointmentsValue>(() => {
    const upcoming = appointments
      .filter((a) => displayStatus(a, now) === "upcoming")
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    return {
      appointments,
      nextAppointment: upcoming[0] ?? null,
      now,
      loading,
      error,
      book: (input) => appointmentService.book(input),
      cancel: (a) => appointmentService.cancel(a),
      getAppointment: (id) => appointments.find((a) => a.id === id),
    };
  }, [appointments, now, loading, error]);

  return <AppointmentsContext.Provider value={value}>{children}</AppointmentsContext.Provider>;
}

export function useAppointments() {
  const ctx = useContext(AppointmentsContext);
  if (!ctx) throw new Error("useAppointments must be used inside DataProvider");
  return ctx;
}

/* ---------- Notifications (live) ---------- */

type NotificationsValue = {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
};
const NotificationsContext = createContext<NotificationsValue | undefined>(undefined);

function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const uid = user?.id ?? null;
  const [snapshot, setSnapshot] = useState<{ uid: string; items: AppNotification[] } | null>(null);
  const [subscription, setSubscription] = useState<{ uid: string; loading: boolean; error: string | null } | null>(null);
  const [actionError, setActionError] = useState<{ uid: string; message: string } | null>(null);

  useEffect(() => {
    if (!uid) return;
    let active = true;
    const unsubscribe = notificationService.subscribeMine(
      uid,
      (items) => {
        if (!active) return;
        setSnapshot({ uid, items });
        setSubscription({ uid, loading: false, error: null });
      },
      (caught) => {
        if (!active) return;
        setSubscription({ uid, loading: false, error: friendlyError(caught, "Could not load notifications.") });
      },
    );
    return () => {
      active = false;
      unsubscribe();
    };
  }, [uid]);

  const notifications = snapshot?.uid === uid ? snapshot.items : EMPTY_NOTIFICATIONS;
  const loading = uid !== null && subscription?.uid !== uid ? true : (subscription?.loading ?? false);
  const error = subscription?.uid === uid
    ? subscription.error ?? (actionError?.uid === uid ? actionError.message : null)
    : null;

  const value = useMemo<NotificationsValue>(
    () => ({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      loading,
      error,
      markRead: async (id) => {
        if (!uid) return;
        setActionError(null);
        try {
          await notificationService.markRead(uid, id);
        } catch (caught) {
          setActionError({ uid, message: friendlyError(caught, "Could not mark this notification as read.") });
        }
      },
      markAllRead: async () => {
        if (!uid) return;
        setActionError(null);
        try {
          await notificationService.markAllRead(uid, notifications.filter((n) => !n.read).map((n) => n.id));
        } catch (caught) {
          setActionError({ uid, message: friendlyError(caught, "Could not mark notifications as read.") });
        }
      },
    }),
    [notifications, loading, error, uid],
  );
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used inside DataProvider");
  return ctx;
}

export function DataProvider({ children }: { children: ReactNode }) {
  return (
    <CatalogProvider>
      <AppointmentsProvider>
        <NotificationsProvider>{children}</NotificationsProvider>
      </AppointmentsProvider>
    </CatalogProvider>
  );
}
