import { Colors, Radius, Spacing } from "@/constants/theme";
import { useAppointments } from "@/context/DataContext";
import { formatDay, formatTime } from "@/lib/format";
import { useStyles } from "@/styles/styles";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { Avatar } from "./doctor-card";
import { ThemedText } from "./themed-text";

const card = { marginHorizontal: Spacing.three, backgroundColor: Colors.primary, borderRadius: Radius.lg, padding: Spacing.three, overflow: "hidden" } as const;

export default function NextAppointment() {
  const styles = useStyles();
  const { nextAppointment: next } = useAppointments();

  if (!next) {
    return (
      <View style={card}>
        <View style={{ position: "absolute", right: -40, top: -40, width: 170, height: 170, borderRadius: 85, backgroundColor: "rgba(255,255,255,0.10)" }} />
        <ThemedText type="small" style={{ color: "#DCEBFF" }}>Upcoming appointment</ThemedText>
        <ThemedText type="bold" style={{ color: "#FFF", marginTop: Spacing.two }}>Nothing booked yet</ThemedText>
        <ThemedText type="small" style={{ color: "#DCEBFF", marginTop: Spacing.one }}>Pick a doctor and a time that suits you.</ThemedText>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/book")}
          accessibilityRole="button"
          style={{ alignSelf: "flex-start", marginTop: Spacing.three, backgroundColor: "#FFF", borderRadius: Radius.pill, paddingVertical: Spacing.two, paddingHorizontal: Spacing.four }}
        >
          <ThemedText type="smallBold" style={{ color: Colors.primary }}>Book a visit</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => router.push("/(tabs)/appointments")} style={card} accessibilityRole="button" accessibilityLabel="View your appointments">
      <View style={{ position: "absolute", right: -40, top: -40, width: 170, height: 170, borderRadius: 85, backgroundColor: "rgba(255,255,255,0.10)" }} />
      <View style={{ position: "absolute", right: 40, bottom: -70, width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(255,255,255,0.07)" }} />
      <ThemedText type="small" style={{ color: "#DCEBFF" }}>Upcoming appointment</ThemedText>
      <View style={[styles.row, { marginTop: Spacing.three }]}>
        <View style={{ borderRadius: 22, borderWidth: 2, borderColor: "rgba(255,255,255,0.5)" }}>
          <Avatar name={next.doctor_name} color={Colors.primaryDark} size={58} />
        </View>
        <View style={{ marginLeft: Spacing.three, flex: 1 }}>
          <ThemedText type="bold" style={{ color: "#FFF" }}>{next.doctor_name}</ThemedText>
          <ThemedText type="small" style={{ color: "#DCEBFF" }}>{next.specialty_name} • {next.clinic_name}</ThemedText>
        </View>
      </View>
      <View style={[styles.rowStretch, { marginTop: Spacing.three, backgroundColor: "rgba(255,255,255,0.16)", borderRadius: Radius.sm, padding: Spacing.two, paddingHorizontal: Spacing.three }]}>
        <View style={styles.row}>
          <MaterialIcons name="event" size={18} color="#FFF" />
          <ThemedText type="smallBold" style={{ color: "#FFF", marginLeft: Spacing.one }}>{formatDay(next.starts_at)}</ThemedText>
        </View>
        <View style={styles.row}>
          <MaterialIcons name="schedule" size={18} color="#FFF" />
          <ThemedText type="smallBold" style={{ color: "#FFF", marginLeft: Spacing.one }}>{formatTime(next.starts_at)}</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
}
