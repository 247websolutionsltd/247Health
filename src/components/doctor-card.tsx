import { Colors, Radius, Shadow, Spacing } from "@/constants/theme";
import { Doctor, initials } from "@/data/doctors";
import { useTheme } from "@/hooks/use-theme";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";

export function Avatar({ name, color, size = 56 }: { name: string; color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 3, backgroundColor: color, alignItems: "center", justifyContent: "center" }}>
      <ThemedText type="bold" style={{ color: "#FFF", fontSize: size / 3 }}>{initials(name)}</ThemedText>
    </View>
  );
}

export function Rating({ value }: { value: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <MaterialIcons name="star" size={14} color={Colors.warning} />
      <ThemedText type="smallBold" style={{ marginLeft: 3 }}>{value.toFixed(1)}</ThemedText>
    </View>
  );
}

// Full-width row card used in lists
export default function DoctorCard({ doctor }: { doctor: Doctor }) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={() => router.push(`/doctors/${doctor.id}` as never)}
      style={[{ backgroundColor: theme.background, borderRadius: Radius.md, padding: Spacing.three, flexDirection: "row", alignItems: "center", marginBottom: Spacing.three }, Shadow]}
    >
      <Avatar name={doctor.name} color={doctor.color} size={64} />
      <View style={{ flex: 1, marginLeft: Spacing.three }}>
        <ThemedText type="bold">{doctor.name}</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>{doctor.specialty} • {doctor.hospital}</ThemedText>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: Spacing.one }}>
          <Rating value={doctor.rating} />
          <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.two }}>{doctor.years} yrs</ThemedText>
          <View style={{ marginLeft: Spacing.two, paddingHorizontal: Spacing.two, borderRadius: 999, backgroundColor: doctor.available ? "#D1FAE5" : theme.backgroundElement }}>
            <ThemedText type="small" style={{ fontSize: 11, color: doctor.available ? "#047857" : theme.textSecondary }}>
              {doctor.available ? "Available" : "Fully booked"}
            </ThemedText>
          </View>
        </View>
      </View>
      <ThemedText type="smallBold" style={{ color: theme.accentText }}>{doctor.fee}</ThemedText>
    </TouchableOpacity>
  );
}
