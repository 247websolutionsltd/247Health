import { Colors, Radius, Shadow, Spacing } from "@/constants/theme";
import { formatMoney, initials } from "@/lib/format";
import { useTheme } from "@/hooks/use-theme";
import type { Doctor } from "@/types/models";
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
      accessibilityRole="button"
      accessibilityLabel={`${doctor.full_name}, ${doctor.specialty_name}`}
      style={[{ backgroundColor: theme.background, borderRadius: Radius.md, padding: Spacing.three, flexDirection: "row", alignItems: "center", marginBottom: Spacing.three }, Shadow]}
    >
      <Avatar name={doctor.full_name} color={doctor.color} size={64} />
      <View style={{ flex: 1, marginLeft: Spacing.three }}>
        <ThemedText type="bold">{doctor.full_name}</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>{doctor.specialty_name} • {doctor.clinic_name}</ThemedText>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: Spacing.one, flexWrap: "wrap" }}>
          <Rating value={doctor.rating} />
          <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.two }}>{doctor.years_experience} yrs</ThemedText>
          <View style={{ marginLeft: Spacing.two, paddingHorizontal: Spacing.two, borderRadius: 999, backgroundColor: doctor.is_bookable ? "#D1FAE5" : theme.backgroundElement }}>
            <ThemedText type="small" style={{ fontSize: 11, color: doctor.is_bookable ? "#047857" : theme.textSecondary }}>
              {doctor.is_bookable ? "Available" : "Not taking bookings"}
            </ThemedText>
          </View>
        </View>
      </View>
      <ThemedText type="smallBold" style={{ color: theme.accentText }}>{formatMoney(doctor.consultation_fee_minor, doctor.currency_code)}</ThemedText>
    </TouchableOpacity>
  );
}
