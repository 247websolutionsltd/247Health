import Container from "@/components/custom-container";
import { Avatar } from "@/components/doctor-card";
import { EmptyView, ErrorView, LoadingView } from "@/components/state-views";
import { ThemedText } from "@/components/themed-text";
import { Colors, Radius, Shadow, Spacing } from "@/constants/theme";
import { displayStatus, useAppointments, type DisplayStatus } from "@/context/DataContext";
import { useTheme } from "@/hooks/use-theme";
import { friendlyError } from "@/lib/errors";
import { formatDay, formatTime } from "@/lib/format";
import type { Appointment } from "@/types/models";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { TouchableOpacity, View } from "react-native";

const TABS: DisplayStatus[] = ["upcoming", "completed", "cancelled"];
const STATUS_COLOR: Record<DisplayStatus, string> = { upcoming: Colors.primary, completed: Colors.success, cancelled: Colors.danger };
const EMPTY: Record<DisplayStatus, string> = {
  upcoming: "No upcoming appointments",
  completed: "No past appointments yet",
  cancelled: "No cancelled appointments",
};

export default function Appointments() {
  const theme = useTheme();
  const { appointments, loading, error, cancel } = useAppointments();
  const [tab, setTab] = useState<DisplayStatus>("upcoming");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const list = useMemo(() => {
    const now = Date.now();
    const filtered = appointments.filter((a) => displayStatus(a, now) === tab);
    // Soonest first for upcoming, most recent first for history.
    return filtered.sort((a, b) => (tab === "upcoming" ? a.starts_at.localeCompare(b.starts_at) : b.starts_at.localeCompare(a.starts_at)));
  }, [appointments, tab]);

  const doCancel = async (a: Appointment) => {
    setBusyId(a.id);
    setFeedback(null);
    try {
      await cancel(a);
      setConfirmingId(null);
    } catch (caught) {
      setFeedback(friendlyError(caught, "We couldn't cancel that appointment. Please try again."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Container edges={["top"]}>
      <View style={{ padding: Spacing.three }}>
        <ThemedText type="large">My appointments</ThemedText>

        <View style={{ flexDirection: "row", backgroundColor: theme.backgroundElement, borderRadius: Radius.pill, padding: 4, marginTop: Spacing.three }}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => { setTab(t); setConfirmingId(null); setFeedback(null); }}
              accessibilityRole="button"
              accessibilityState={{ selected: tab === t }}
              style={{ flex: 1, paddingVertical: Spacing.two, borderRadius: Radius.pill, alignItems: "center", backgroundColor: tab === t ? Colors.primary : "transparent" }}
            >
              <ThemedText type="smallBold" style={{ color: tab === t ? "#FFF" : theme.textSecondary, textTransform: "capitalize" }}>{t}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {feedback && <ThemedText type="small" style={{ color: Colors.danger, marginTop: Spacing.three }}>{feedback}</ThemedText>}

        <View style={{ marginTop: Spacing.three }}>
          {error && appointments.length === 0 ? (
            <ErrorView message={error} />
          ) : loading && appointments.length === 0 ? (
            <LoadingView label="Loading your appointments..." />
          ) : list.length === 0 ? (
            <View>
              <EmptyView icon="event-busy" title={EMPTY[tab]} />
              {tab === "upcoming" && (
                <TouchableOpacity onPress={() => router.push("/(tabs)/book")} accessibilityRole="button" style={{ alignSelf: "center", backgroundColor: Colors.primary, borderRadius: Radius.pill, paddingVertical: Spacing.two, paddingHorizontal: Spacing.four }}>
                  <ThemedText type="smallBold" style={{ color: "#FFF" }}>Book a visit</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            list.map((a) => (
              <View key={a.id} style={[{ backgroundColor: theme.background, borderRadius: Radius.md, padding: Spacing.three, marginBottom: Spacing.three }, Shadow]}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Avatar name={a.doctor_name} color={a.doctor_color} size={54} />
                  <View style={{ flex: 1, marginLeft: Spacing.three }}>
                    <ThemedText type="bold">{a.doctor_name}</ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>{a.specialty_name} • {a.clinic_name}</ThemedText>
                  </View>
                  <View style={{ backgroundColor: theme.accentSurface, borderRadius: 999, paddingHorizontal: Spacing.two, paddingVertical: 2 }}>
                    <ThemedText type="small" style={{ fontSize: 11, color: STATUS_COLOR[tab], textTransform: "capitalize" }}>{tab}</ThemedText>
                  </View>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: theme.paper, borderRadius: Radius.sm, padding: Spacing.two, paddingHorizontal: Spacing.three, marginTop: Spacing.three }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MaterialIcons name="event" size={16} color={Colors.primary} />
                    <ThemedText type="small" style={{ marginLeft: Spacing.one }}>{formatDay(a.starts_at)}</ThemedText>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MaterialIcons name="schedule" size={16} color={Colors.primary} />
                    <ThemedText type="small" style={{ marginLeft: Spacing.one }}>{formatTime(a.starts_at)}</ThemedText>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MaterialIcons name={a.consultation_type === "video_call" ? "videocam" : "local-hospital"} size={16} color={Colors.primary} />
                    <ThemedText type="small" style={{ marginLeft: Spacing.one }}>{a.consultation_type === "video_call" ? "Video call" : "In-person"}</ThemedText>
                  </View>
                </View>

                {tab === "upcoming" && confirmingId === a.id ? (
                  <View style={{ marginTop: Spacing.three }}>
                    <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.two }}>Cancel this appointment? The time will be released for other patients.</ThemedText>
                    <View style={{ flexDirection: "row", gap: Spacing.two }}>
                      <TouchableOpacity onPress={() => setConfirmingId(null)} disabled={busyId === a.id} accessibilityRole="button" style={{ flex: 1, height: 44, borderRadius: Radius.pill, borderWidth: 1, borderColor: theme.line, alignItems: "center", justifyContent: "center" }}>
                        <ThemedText type="smallBold">Keep it</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => void doCancel(a)} disabled={busyId === a.id} accessibilityRole="button" style={{ flex: 1, height: 44, borderRadius: Radius.pill, backgroundColor: Colors.danger, alignItems: "center", justifyContent: "center", opacity: busyId === a.id ? 0.6 : 1 }}>
                        <ThemedText type="smallBold" style={{ color: "#FFF" }}>{busyId === a.id ? "Cancelling..." : "Yes, cancel"}</ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : tab === "upcoming" ? (
                  <View style={{ flexDirection: "row", marginTop: Spacing.three, gap: Spacing.two }}>
                    <TouchableOpacity onPress={() => setConfirmingId(a.id)} accessibilityRole="button" style={{ flex: 1, height: 44, borderRadius: Radius.pill, borderWidth: 1, borderColor: theme.line, alignItems: "center", justifyContent: "center" }}>
                      <ThemedText type="smallBold">Cancel</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push({ pathname: "/(tabs)/book", params: { doctorId: a.doctor_id, rescheduleId: a.id } } as never)} accessibilityRole="button" style={{ flex: 1, height: 44, borderRadius: Radius.pill, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" }}>
                      <ThemedText type="smallBold" style={{ color: "#FFF" }}>Reschedule</ThemedText>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => router.push({ pathname: "/(tabs)/book", params: { doctorId: a.doctor_id } } as never)} accessibilityRole="button" style={{ marginTop: Spacing.three, height: 44, borderRadius: Radius.pill, backgroundColor: theme.accentSurface, alignItems: "center", justifyContent: "center" }}>
                    <ThemedText type="smallBold" style={{ color: Colors.primary }}>Book again</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>
      </View>
    </Container>
  );
}
