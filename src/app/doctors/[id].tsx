import Back from "@/components/back";
import Button from "@/components/button";
import Container from "@/components/custom-container";
import { Avatar } from "@/components/doctor-card";
import { ThemedText } from "@/components/themed-text";
import { Colors, Radius, Shadow, Spacing } from "@/constants/theme";
import { doctors } from "@/data/doctors";
import { useTheme } from "@/hooks/use-theme";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function DoctorProfile() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const d = doctors.find((x) => x.id === id) ?? doctors[0];
  const stats = [
    { label: "Patients", value: d.patients },
    { label: "Experience", value: `${d.years} yrs` },
    { label: "Rating", value: d.rating.toFixed(1) },
    { label: "Reviews", value: String(d.reviews) },
  ];

  return (
    <Container edges={["top"]}>
      <View style={{ padding: Spacing.three }}>
        <Back />
        <View style={{ alignItems: "center", marginTop: Spacing.two }}>
          <Avatar name={d.name} color={d.color} size={104} />
          <ThemedText type="subtitle" style={{ marginTop: Spacing.three }}>{d.name}</ThemedText>
          <ThemedText style={{ color: Colors.primary }}>{d.specialty}</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>{d.hospital}</ThemedText>
        </View>

        <View style={[{ flexDirection: "row", backgroundColor: theme.background, borderRadius: Radius.md, padding: Spacing.three, marginTop: Spacing.four }, Shadow]}>
          {stats.map((s) => (
            <View key={s.label} style={{ flex: 1, alignItems: "center" }}>
              <ThemedText type="bold" style={{ color: Colors.primary }}>{s.value}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary, fontSize: 12 }}>{s.label}</ThemedText>
            </View>
          ))}
        </View>

        <ThemedText type="bold" style={{ marginTop: Spacing.four }}>About</ThemedText>
        <ThemedText style={{ color: theme.textSecondary, marginTop: Spacing.one, lineHeight: 23 }}>{d.about}</ThemedText>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: Spacing.four }}>
          <View>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>Consultation fee</ThemedText>
            <ThemedText type="subtitle">{d.fee}</ThemedText>
          </View>
          <Button
            title={d.available ? "Book appointment" : "Unavailable"}
            disabled={!d.available}
            style={{ paddingHorizontal: Spacing.four }}
            onPress={() => router.push({ pathname: "/(tabs)/book", params: { doctorId: d.id } } as never)}
          />
        </View>
      </View>
    </Container>
  );
}
