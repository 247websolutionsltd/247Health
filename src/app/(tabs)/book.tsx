import Back from "@/components/back";
import Button from "@/components/button";
import Container from "@/components/custom-container";
import Input from "@/components/custom-input";
import { Avatar } from "@/components/doctor-card";
import { EmptyView, ErrorView, LoadingView } from "@/components/state-views";
import { ThemedText } from "@/components/themed-text";
import { Colors, Radius, Shadow, Spacing } from "@/constants/theme";
import { useAppointments, useCatalog } from "@/context/DataContext";
import { useTheme } from "@/hooks/use-theme";
import { friendlyError } from "@/lib/errors";
import { dayKey, dayParts, formatDay, formatMoney, formatTime } from "@/lib/format";
import { catalogService } from "@/services/catalog-service";
import type { ConsultationType, DoctorSlot } from "@/types/models";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";

const TYPES: { value: ConsultationType; label: string; icon: "local-hospital" | "videocam" }[] = [
  { value: "in_person", label: "In-person", icon: "local-hospital" },
  { value: "video_call", label: "Video call", icon: "videocam" },
];

export default function Book() {
  const theme = useTheme();
  const { doctorId, rescheduleId } = useLocalSearchParams<{ doctorId?: string; rescheduleId?: string }>();
  const { doctors, loading: catalogLoading, error: catalogError, reload, getDoctor } = useCatalog();
  const { book, cancel, getAppointment } = useAppointments();

  const rescheduling = rescheduleId ? getAppointment(rescheduleId) : undefined;
  const bookable = useMemo(() => doctors.filter((d) => d.is_bookable), [doctors]);
  const [chosenId, setChosenId] = useState<string | null>(doctorId ?? null);
  const doctor = getDoctor(chosenId ?? undefined) ?? (rescheduling ? undefined : bookable[0]);

  const [slots, setSlots] = useState<DoctorSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [type, setType] = useState<ConsultationType>(rescheduling?.consultation_type ?? "in_person");
  const [reason, setReason] = useState(rescheduling?.reason_for_visit ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const doctorKey = doctor?.id;
  useEffect(() => {
    setSlots([]);
    setSelectedDay(null);
    setSlotId(null);
    setSlotsError(null);
    if (!doctorKey) return;
    setSlotsLoading(true);
    return catalogService.subscribeOpenSlots(
      doctorKey,
      (next) => { setSlots(next); setSlotsLoading(false); setSlotsError(null); },
      (caught) => { setSlotsError(friendlyError(caught, "Could not load available times.")); setSlotsLoading(false); },
    );
  }, [doctorKey]);

  const days = useMemo(() => {
    const map = new Map<string, DoctorSlot[]>();
    for (const s of slots) {
      const key = dayKey(s.starts_at);
      map.set(key, [...(map.get(key) ?? []), s]);
    }
    return [...map.entries()].map(([key, list]) => ({ key, first: list[0].starts_at, list }));
  }, [slots]);

  const activeDay = days.find((d) => d.key === selectedDay) ?? days[0];
  const selectedSlot = slots.find((s) => s.id === slotId) ?? null; // clears itself if someone else takes it

  const confirm = async () => {
    if (!doctor || !selectedSlot) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const appointment = await book({ doctor, slot: selectedSlot, consultation_type: type, reason_for_visit: reason.trim() || null });
      if (rescheduling) {
        try {
          await cancel(rescheduling);
        } catch {
          setSubmitting(false);
          setFeedback("Your new appointment is booked, but we couldn't cancel the old one. Cancel it from the Visits tab.");
          return;
        }
      }
      router.replace({ pathname: "/booking-confirmation", params: { appointmentId: appointment.id } } as never);
    } catch (caught) {
      setFeedback(friendlyError(caught, "We couldn't book that appointment. Please try again."));
      setSubmitting(false);
    }
  };

  const Label = ({ children }: { children: string }) => (
    <ThemedText type="bold" style={{ marginTop: Spacing.four, marginBottom: Spacing.two }}>{children}</ThemedText>
  );

  let body: React.ReactNode;
  if (catalogError && doctors.length === 0) body = <ErrorView message={catalogError} onRetry={() => void reload()} />;
  else if (catalogLoading && doctors.length === 0) body = <LoadingView />;
  else if (!doctor) body = <EmptyView icon="medical-services" title="No doctors available" message="Check back soon." />;
  else {
    body = (
      <>
        {rescheduling ? (
          <View style={{ backgroundColor: theme.accentSurface, borderRadius: Radius.md, padding: Spacing.three, marginTop: Spacing.three }}>
            <ThemedText type="small" style={{ color: theme.accentText }}>
              Rescheduling your visit on {formatDay(rescheduling.starts_at)} at {formatTime(rescheduling.starts_at)}. Your old time is released once the new one is confirmed.
            </ThemedText>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: Spacing.three }}>
            {bookable.map((d) => (
              <TouchableOpacity
                key={d.id}
                onPress={() => setChosenId(d.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: doctor.id === d.id }}
                style={{ alignItems: "center", marginRight: Spacing.three, padding: Spacing.two, borderRadius: Radius.md, backgroundColor: doctor.id === d.id ? theme.accentSurface : "transparent", borderWidth: 2, borderColor: doctor.id === d.id ? Colors.primary : "transparent" }}
              >
                <Avatar name={d.full_name} color={d.color} size={52} />
                <ThemedText type="small" style={{ fontSize: 12, marginTop: 4 }}>{d.full_name.replace("Dr. ", "").split(" ")[0]}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.one }}>
          {doctor.full_name} • {doctor.specialty_name} • {formatMoney(doctor.consultation_fee_minor, doctor.currency_code)}
        </ThemedText>

        <Label>Select date</Label>
        {slotsError ? (
          <ErrorView message={slotsError} />
        ) : slotsLoading ? (
          <LoadingView label="Loading available times..." />
        ) : days.length === 0 ? (
          <EmptyView icon="event-busy" title="No available times" message="This doctor has no open slots right now. Try another doctor or check back later." />
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {days.map((d) => {
                const p = dayParts(d.first);
                const on = activeDay?.key === d.key;
                return (
                  <TouchableOpacity
                    key={d.key}
                    onPress={() => { setSelectedDay(d.key); setSlotId(null); }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    style={[{ width: 64, paddingVertical: Spacing.three, alignItems: "center", borderRadius: Radius.md, marginRight: Spacing.two, backgroundColor: on ? Colors.primary : theme.background }, on ? {} : Shadow]}
                  >
                    <ThemedText type="small" style={{ color: on ? "#DCEBFF" : theme.textSecondary }}>{p.weekday}</ThemedText>
                    <ThemedText type="bold" style={{ color: on ? "#FFF" : theme.text, marginTop: 2 }}>{p.date}</ThemedText>
                    <ThemedText type="small" style={{ color: on ? "#DCEBFF" : theme.textSecondary, fontSize: 11 }}>{p.month}</ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Label>Available time</Label>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: Spacing.two }}>
              {activeDay?.list.map((s) => {
                const on = slotId === s.id;
                return (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => setSlotId(s.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    style={{ width: "31%", paddingVertical: Spacing.two + 2, alignItems: "center", borderRadius: Radius.pill, backgroundColor: on ? Colors.primary : theme.background, borderWidth: 1, borderColor: on ? Colors.primary : theme.line }}
                  >
                    <ThemedText type="small" style={{ color: on ? "#FFF" : theme.text }}>{formatTime(s.starts_at)}</ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        <Label>Consultation type</Label>
        <View style={{ flexDirection: "row", gap: Spacing.two }}>
          {TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              onPress={() => setType(t.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: type === t.value }}
              style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", padding: Spacing.three, borderRadius: Radius.md, backgroundColor: type === t.value ? theme.accentSurface : theme.background, borderWidth: 2, borderColor: type === t.value ? Colors.primary : theme.line }}
            >
              <MaterialIcons name={t.icon} size={20} color={Colors.primary} />
              <ThemedText type="smallBold" style={{ marginLeft: Spacing.two }}>{t.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
        {type === "video_call" && (
          <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.two }}>
            The clinic will contact you with joining details before your visit.
          </ThemedText>
        )}

        <Input label="Reason for visit (optional)" placeholder="Describe your symptoms" desc value={reason} onChangeText={setReason} maxLength={1000} />

        {feedback && <ThemedText type="small" style={{ color: Colors.danger, marginBottom: Spacing.two }}>{feedback}</ThemedText>}
        <Button
          title={rescheduling ? "Confirm new time" : "Confirm booking"}
          disabled={!selectedSlot || submitting}
          isLoading={submitting}
          onPress={confirm}
          style={{ marginTop: Spacing.two }}
        />
      </>
    );
  }

  return (
    <Container edges={["top"]}>
      <View style={{ padding: Spacing.three }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Back />
          <ThemedText type="large">{rescheduling ? "Reschedule" : "Book appointment"}</ThemedText>
        </View>
        {body}
      </View>
    </Container>
  );
}
