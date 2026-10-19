import Button from "@/components/button";
import Container from "@/components/custom-container";
import { Avatar } from "@/components/doctor-card";
import { LoadingView } from "@/components/state-views";
import { ThemedText } from "@/components/themed-text";
import { Colors, Radius, Shadow, Spacing } from "@/constants/theme";
import { useAppointments } from "@/context/DataContext";
import { useTheme } from "@/hooks/use-theme";
import { formatDay, formatMoney, formatTime } from "@/lib/format";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function BookingConfirmation() {
  const theme = useTheme();
  const { appointmentId } = useLocalSearchParams<{ appointmentId: string }>();
  const { getAppointment, loading } = useAppointments();
  const a = getAppointment(appointmentId);

  const actions = (
    <View style={{ marginTop: Spacing.four, gap: Spacing.two }}>
      <Button title="View my appointments" onPress={() => router.replace("/(tabs)/appointments")} isLoading={false} />
      <Button title="Back to home" type="secondary" onPress={() => router.replace("/(tabs)/home")} isLoading={false} />
    </View>
  );

  return (
    <Container edges={["top", "bottom"]} style={{ justifyContent: "center", padding: Spacing.three }}>
      <View style={{ alignItems: "center" }}>
        <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: theme.accentSurface, alignItems: "center", justifyContent: "center" }}>
          <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" }}>
            <MaterialIcons name="check" size={48} color="#FFF" />
          </View>
        </View>
        <ThemedText type="subtitle" style={{ marginTop: Spacing.four }}>Appointment booked!</ThemedText>
        <ThemedText style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.one }}>
          Please arrive 10 minutes early. You can cancel any time from the Visits tab.
        </ThemedText>
      </View>

      {a ? (
        <View style={[{ backgroundColor: theme.background, borderRadius: Radius.lg, padding: Spacing.three, marginTop: Spacing.four }, Shadow]}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Avatar name={a.doctor_name} color={a.doctor_color} size={56} />
            <View style={{ marginLeft: Spacing.three, flex: 1 }}>
              <ThemedText type="bold">{a.doctor_name}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>{a.specialty_name} • {a.clinic_name}</ThemedText>
            </View>
          </View>
          <View style={{ height: 1, backgroundColor: theme.line, marginVertical: Spacing.three }} />
          {[
            { icon: "event", text: formatDay(a.starts_at) },
            { icon: "schedule", text: formatTime(a.starts_at) },
            { icon: a.consultation_type === "video_call" ? "videocam" : "local-hospital", text: a.consultation_type === "video_call" ? "Video call" : "In-person" },
            { icon: "payments", text: `${formatMoney(a.consultation_fee_minor, a.currency_code)} • pay at the clinic` },
          ].map((r) => (
            <View key={r.icon} style={{ flexDirection: "row", alignItems: "center", marginBottom: Spacing.two }}>
              <MaterialIcons name={r.icon as never} size={20} color={Colors.primary} />
              <ThemedText style={{ marginLeft: Spacing.two }}>{r.text}</ThemedText>
            </View>
          ))}
        </View>
      ) : loading ? (
        <LoadingView label="Loading your booking..." />
      ) : null}

      {actions}
    </Container>
  );
}
