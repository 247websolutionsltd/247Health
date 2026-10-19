import Container from "@/components/custom-container";
import DoctorCard, { Avatar } from "@/components/doctor-card";
import NextAppointment from "@/components/next-appointment";
import Search from "@/components/search";
import { EmptyView, ErrorView, LoadingView } from "@/components/state-views";
import { ThemedText } from "@/components/themed-text";
import { Colors, Radius, Shadow, Spacing } from "@/constants/theme";
import { useCatalog, useNotifications } from "@/context/DataContext";
import { useAuth } from "@/context/PageContext";
import { quickActions } from "@/data/homeCardData";
import { useTheme } from "@/hooks/use-theme";
import { useStyles } from "@/styles/styles";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";

export default function Home() {
  const styles = useStyles();
  const theme = useTheme();
  const { owner } = useAuth();
  const { specialties, doctors, loading, error, reload } = useCatalog();
  const { unreadCount } = useNotifications();
  const firstName = owner.name.split(" ")[0];

  const topDoctors = useMemo(
    () => doctors.filter((d) => d.is_bookable).sort((a, b) => b.rating - a.rating).slice(0, 3),
    [doctors],
  );

  return (
    <Container edges={["top"]}>
      <View style={[styles.rowStretch, { padding: Spacing.three, paddingBottom: Spacing.two }]}>
        <View style={{ flex: 1, marginRight: Spacing.three }}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>Hello 👋</ThemedText>
          <ThemedText type="subtitle" numberOfLines={1}>{firstName}</ThemedText>
        </View>
        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/notification")}
            accessibilityRole="button"
            accessibilityLabel={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
            style={[{ width: 46, height: 46, borderRadius: 16, backgroundColor: theme.background, alignItems: "center", justifyContent: "center", marginRight: Spacing.two }, Shadow]}
          >
            <MaterialIcons name="notifications-none" size={24} color={theme.text} />
            {unreadCount > 0 && (
              <View style={{ position: "absolute", top: 11, right: 12, width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.danger, borderWidth: 2, borderColor: theme.background }} />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} accessibilityRole="button" accessibilityLabel="Your profile">
            {owner.profileImage
              ? <Image source={{ uri: owner.profileImage }} style={{ width: 46, height: 46, borderRadius: Radius.sm }} />
              : <Avatar name={owner.name} color={Colors.primary} size={46} />}
          </TouchableOpacity>
        </View>
      </View>

      <Search style={{ marginHorizontal: Spacing.three, marginTop: Spacing.two }} />
      <NextAppointment />

      <View style={[styles.rowStretch, { paddingHorizontal: Spacing.three, marginTop: Spacing.four }]}>
        {quickActions.map((a) => (
          <TouchableOpacity key={a.title} onPress={() => router.push(a.route as never)} accessibilityRole="button" style={{ alignItems: "center", width: "24%" }}>
            <View style={{ width: 62, height: 62, borderRadius: 22, backgroundColor: theme.accentSurface, alignItems: "center", justifyContent: "center" }}>
              <MaterialIcons name={a.icon} size={28} color={Colors.primary} />
            </View>
            <ThemedText type="small" style={{ marginTop: Spacing.one, fontSize: 12, textAlign: "center" }}>{a.title}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {error && doctors.length === 0 ? (
        <ErrorView message={error} onRetry={() => void reload()} />
      ) : loading && doctors.length === 0 ? (
        <LoadingView label="Loading doctors..." />
      ) : doctors.length === 0 ? (
        <EmptyView icon="medical-services" title="No doctors available yet" message="Check back soon." />
      ) : (
        <>
          <View style={[styles.rowStretch, { paddingHorizontal: Spacing.three, marginTop: Spacing.four, marginBottom: Spacing.two }]}>
            <ThemedText type="bold">Specialties</ThemedText>
            <TouchableOpacity onPress={() => router.push("/doctors" as never)}>
              <ThemedText type="small" style={{ color: Colors.primary }}>See all</ThemedText>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.three }}>
            {specialties.map((s) => (
              <TouchableOpacity
                key={s.id}
                onPress={() => router.push({ pathname: "/doctors", params: { specialty: s.id } } as never)}
                accessibilityRole="button"
                style={[{ flexDirection: "row", alignItems: "center", backgroundColor: theme.background, paddingVertical: Spacing.two, paddingHorizontal: Spacing.three, borderRadius: Radius.pill, marginRight: Spacing.two }, Shadow]}
              >
                <MaterialIcons name={s.icon as never} size={18} color={Colors.primary} />
                <ThemedText type="smallBold" style={{ marginLeft: Spacing.one }}>{s.name}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={[styles.rowStretch, { paddingHorizontal: Spacing.three, marginTop: Spacing.four, marginBottom: Spacing.three }]}>
            <ThemedText type="bold">Top doctors</ThemedText>
            <TouchableOpacity onPress={() => router.push("/doctors" as never)}>
              <ThemedText type="small" style={{ color: Colors.primary }}>See all</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={{ paddingHorizontal: Spacing.three }}>
            {topDoctors.map((d) => <DoctorCard key={d.id} doctor={d} />)}
          </View>
        </>
      )}
    </Container>
  );
}
