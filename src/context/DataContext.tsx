import { useAuth } from "@/context/PageContext";
import { friendlyError } from "@/lib/errors";
import { appointmentService, type BookInput } from "@/services/appointment-service";
import { catalogService } from "@/services/catalog-service";
import { notificationService } from "@/services/notification-service";
import type { Appointment, AppNotification, Doctor, Specialty } from "@/types/models";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

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
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, d] = await Promise.all([catalogService.listSpecialties(), catalogService.listDoctors()]);
      setSpecialties(s);
      setDoctors(d);
    } catch (caught) {
      setError(friendlyError(caught, "Could not load doctors."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!uid) {
      setSpecialties([]);
      setDoctors([]);
      setError(null);
      return;
    }
    void load();
  }, [uid, load]);

  const value = useMemo<CatalogValue>(
    () => ({ specialties, doctors, loading, error, reload: load, getDoctor: (id) => doctors.find((d) => d.id === id) }),
    [specialties, doctors, loading, error, load],
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
export function displayStatus(a: Appointment, now = Date.now()): DisplayStatus {
  if (a.status === "cancelled") return "cancelled";
  if (a.status === "completed" || new Date(a.ends_at).getTime() <= now) return "completed";
  return "upcoming";
}

type AppointmentsValue = {
  appointments: Appointment[];
  nextAppointment: Appointment | null;
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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Re-evaluate "upcoming vs completed" as time passes.
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!uid) {
      setAppointments([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    return appointmentService.subscribeMine(
      uid,
      (items) => {
        setAppointments(items);
        setError(null);
        setLoading(false);
      },
      (caught) => {
        setError(friendlyError(caught, "Could not load your appointments."));
        setLoading(false);
      },
    );
  }, [uid]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const value = useMemo<AppointmentsValue>(() => {
    const now = Date.now();
    const upcoming = appointments
      .filter((a) => displayStatus(a, now) === "upcoming")
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    return {
      appointments,
      nextAppointment: upcoming[0] ?? null,
      loading,
      error,
      book: (input) => appointmentService.book(input),
      cancel: (a) => appointmentService.cancel(a),
      getAppointment: (id) => appointments.find((a) => a.id === id),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments, loading, error, tick]);

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
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setNotifications([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    return notificationService.subscribeMine(
      uid,
      (items) => {
        setNotifications(items);
        setError(null);
        setLoading(false);
      },
      (caught) => {
        setError(friendlyError(caught, "Could not load notifications."));
        setLoading(false);
      },
    );
  }, [uid]);

  const value = useMemo<NotificationsValue>(
    () => ({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      loading,
      error,
      markRead: async (id) => {
        if (uid) await notificationService.markRead(uid, id).catch(() => undefined);
      },
      markAllRead: async () => {
        if (uid) {
          await notificationService.markAllRead(uid, notifications.filter((n) => !n.read).map((n) => n.id)).catch(() => undefined);
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
