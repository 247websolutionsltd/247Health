import Button from "@/components/button";
import Container from "@/components/custom-container";
import { Avatar } from "@/components/doctor-card";
import { ThemedText } from "@/components/themed-text";
import { Colors, Radius, Shadow, Spacing } from "@/constants/theme";
import { doctors } from "@/data/doctors";
import { useTheme } from "@/hooks/use-theme";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function BookingConfirmation() {
  const theme = useTheme();
  const { doctorId, date, time, mode } = useLocalSearchParams<{ doctorId: string; date: string; time: string; mode: string }>();
  const d = doctors.find((x) => x.id === doctorId) ?? doctors[0];

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
          We've sent the details to your email. Please arrive 10 minutes early.
        </ThemedText>
      </View>

      <View style={[{ backgroundColor: theme.background, borderRadius: Radius.lg, padding: Spacing.three, marginTop: Spacing.four }, Shadow]}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Avatar name={d.name} color={d.color} size={56} />
          <View style={{ marginLeft: Spacing.three }}>
            <ThemedText type="bold">{d.name}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>{d.specialty} • {d.hospital}</ThemedText>
          </View>
        </View>
        <View style={{ height: 1, backgroundColor: theme.line, marginVertical: Spacing.three }} />
        {[{ icon: "event", v: date }, { icon: "schedule", v: time }, { icon: mode === "Video call" ? "videocam" : "local-hospital", v: mode }].map((r) => (
          <View key={r.icon} style={{ flexDirection: "row", alignItems: "center", marginBottom: Spacing.two }}>
            <MaterialIcons name={r.icon as any} size={20} color={Colors.primary} />
            <ThemedText style={{ marginLeft: Spacing.two }}>{r.v}</ThemedText>
          </View>
        ))}
      </View>

      <View style={{ marginTop: Spacing.four, gap: Spacing.two }}>
        <Button title="View my appointments" onPress={() => router.replace("/(tabs)/appointments" as never)} isLoading={false} />
        <Button title="Back to home" type="secondary" onPress={() => router.replace("/(tabs)/home")} isLoading={false} />
      </View>
    </Container>
  );
}
