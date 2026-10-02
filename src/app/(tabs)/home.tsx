import Container from "@/components/custom-container";
import DoctorCard from "@/components/doctor-card";
import NextAppointment from "@/components/next-appointment";
import Search from "@/components/search";
import { ThemedText } from "@/components/themed-text";
import { Colors, Radius, Shadow, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/PageContext";
import { appointments } from "@/data/appointments";
import { doctors, specialties } from "@/data/doctors";
import { quickActions } from "@/data/homeCardData";
import { useTheme } from "@/hooks/use-theme";
import { useStyles } from "@/styles/styles";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ScrollView, TouchableOpacity, View } from "react-native";

export default function Home() {
  const styles = useStyles();
  const theme = useTheme();
  const { owner } = useAuth();
  const next = appointments.find((a) => a.status === "upcoming")!;
  const nextDoc = doctors.find((d) => d.id === next.doctorId)!;
  const firstName = owner.name.split(" ")[0];

  return (
    <Container edges={["top"]}>
      {/* Header */}
      <View style={[styles.rowStretch, { padding: Spacing.three, paddingBottom: Spacing.two }]}>
        <View>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>Hello 👋</ThemedText>
          <ThemedText type="subtitle">{firstName}</ThemedText>
        </View>
        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/notification")}
            style={[{ width: 46, height: 46, borderRadius: 16, backgroundColor: theme.background, alignItems: "center", justifyContent: "center", marginRight: Spacing.two }, Shadow]}
          >
            <MaterialIcons name="notifications-none" size={24} color={theme.text} />
            <View style={{ position: "absolute", top: 11, right: 12, width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.danger, borderWidth: 2, borderColor: theme.background }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}> 
            {/* <Avatar name="David Nwaeze" color={Colors.primary} size={46} /> */}
            <Image source={{uri:owner.profileImage}} style={{width:46, height:46, borderRadius:Radius.sm}}/>
          </TouchableOpacity>
        </View>
      </View>

      <Search style={{ marginHorizontal: Spacing.three, marginTop: Spacing.two }} />
      <NextAppointment/>

      <View style={[styles.rowStretch, { paddingHorizontal: Spacing.three, marginTop: Spacing.four }]}>
        {quickActions.map((a) => (
          <TouchableOpacity key={a.title} onPress={() => router.push(a.route as never)} style={{ alignItems: "center", width: "24%" }}>
            <View style={{ width: 62, height: 62, borderRadius: 22, backgroundColor: theme.accentSurface, alignItems: "center", justifyContent: "center" }}>
              <MaterialIcons name={a.icon} size={28} color={Colors.primary} />
            </View>
            <ThemedText type="small" style={{ marginTop: Spacing.one, fontSize: 12 }}>{a.title}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.rowStretch, { paddingHorizontal: Spacing.three, marginTop: Spacing.four, marginBottom: Spacing.two }]}>
        <ThemedText type="bold">Specialties</ThemedText>
        <TouchableOpacity onPress={() => router.push("/doctors" as never)}>
          <ThemedText type="small" style={{ color: Colors.primary }}>See all</ThemedText>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.three }}>
        {specialties.map((s) => (
          <TouchableOpacity
            key={s.name}
            onPress={() => router.push({ pathname: "/doctors", params: { specialty: s.name } } as never)}
            style={[{ flexDirection: "row", alignItems: "center", backgroundColor: theme.background, paddingVertical: Spacing.two, paddingHorizontal: Spacing.three, borderRadius: Radius.pill, marginRight: Spacing.two }, Shadow]}
          >
            <MaterialIcons name={s.icon} size={18} color={Colors.primary} />
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
        {doctors.slice(0, 3).map((d) => <DoctorCard key={d.id} doctor={d} />)}
      </View>
      
    </Container>
  );
}
