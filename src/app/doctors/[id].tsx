import Back from "@/components/back";
import Button from "@/components/button";
import Container from "@/components/custom-container";
import { Avatar } from "@/components/doctor-card";
import { EmptyView, LoadingView } from "@/components/state-views";
import { ThemedText } from "@/components/themed-text";
import { Colors, Radius, Shadow, Spacing } from "@/constants/theme";
import { useCatalog } from "@/context/DataContext";
import { useTheme } from "@/hooks/use-theme";
import { formatMoney } from "@/lib/format";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function DoctorProfile() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getDoctor, loading } = useCatalog();
  const d = getDoctor(id);

  if (!d) {
    return (
      <Container edges={["top"]}>
        <View style={{ padding: Spacing.three }}>
          <Back />
          {loading ? <LoadingView /> : <EmptyView icon="person-off" title="Doctor not found" message="This profile may have been removed." />}
        </View>
      </Container>
    );
  }

  const stats = [
    { label: "Experience", value: `${d.years_experience} yrs` },
    { label: "Rating", value: d.rating.toFixed(1) },
    { label: "Reviews", value: String(d.review_count) },
  ];

  return (
    <Container edges={["top"]}>
      <View style={{ padding: Spacing.three }}>
        <Back />
        <View style={{ alignItems: "center", marginTop: Spacing.two }}>
          <Avatar name={d.full_name} color={d.color} size={104} />
          <ThemedText type="subtitle" style={{ marginTop: Spacing.three, textAlign: "center" }}>{d.full_name}</ThemedText>
          <ThemedText style={{ color: Colors.primary }}>{d.specialty_name}</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>{d.clinic_name}</ThemedText>
        </View>

        <View style={[{ flexDirection: "row", backgroundColor: theme.background, borderRadius: Radius.md, padding: Spacing.three, marginTop: Spacing.four }, Shadow]}>
          {stats.map((s) => (
            <View key={s.label} style={{ flex: 1, alignItems: "center" }}>
              <ThemedText type="bold" style={{ color: Colors.primary }}>{s.value}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary, fontSize: 12 }}>{s.label}</ThemedText>
            </View>
          ))}
        </View>

        {d.biography ? (
          <>
            <ThemedText type="bold" style={{ marginTop: Spacing.four }}>About</ThemedText>
            <ThemedText style={{ color: theme.textSecondary, marginTop: Spacing.one, lineHeight: 23 }}>{d.biography}</ThemedText>
          </>
        ) : null}

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: Spacing.four }}>
          <View>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>Consultation fee</ThemedText>
            <ThemedText type="subtitle">{formatMoney(d.consultation_fee_minor, d.currency_code)}</ThemedText>
          </View>
          <Button
            title={d.is_bookable ? "Book appointment" : "Not taking bookings"}
            disabled={!d.is_bookable}
            isLoading={false}
            style={{ paddingHorizontal: Spacing.four }}
            onPress={() => router.push({ pathname: "/(tabs)/book", params: { doctorId: d.id } } as never)}
          />
        </View>
        <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.two }}>
          Fees are paid at the clinic. You aren&apos;t charged in the app.
        </ThemedText>
      </View>
    </Container>
  );
}
