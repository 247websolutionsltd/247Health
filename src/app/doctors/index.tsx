import Back from "@/components/back";
import Container from "@/components/custom-container";
import DoctorCard from "@/components/doctor-card";
import { ThemedText } from "@/components/themed-text";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { doctors, specialties } from "@/data/doctors";
import { useTheme } from "@/hooks/use-theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, TextInput, TouchableOpacity, View } from "react-native";

export default function Doctors() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ query?: string; specialty?: string }>();
  const [query, setQuery] = useState(params.query ?? "");
  const [spec, setSpec] = useState(params.specialty ?? "All");

  const list = doctors.filter((d) =>
    (spec === "All" || d.specialty === spec) &&
    `${d.name} ${d.specialty} ${d.hospital}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Container edges={["top"]}>
      <View style={{ padding: Spacing.three }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Back />
          <ThemedText type="large">Find a doctor</ThemedText>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: theme.background, borderRadius: Radius.pill, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, marginTop: Spacing.three }}>
          <MaterialIcons name="search" size={20} color={theme.textSecondary} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Search doctors or hospitals" placeholderTextColor={theme.textSecondary} style={{ flex: 1, marginLeft: Spacing.two, color: theme.text, fontSize: 15 }} />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.three }} style={{ flexGrow: 0 }}>
        {["All", ...specialties.map((s) => s.name)].map((n) => (
          <TouchableOpacity key={n} onPress={() => setSpec(n)} style={{ paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: Radius.pill, marginRight: Spacing.two, backgroundColor: spec === n ? Colors.primary : theme.background }}>
            <ThemedText type="smallBold" style={{ color: spec === n ? "#FFF" : theme.text }}>{n}</ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ padding: Spacing.three }}>
        <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.three }}>{list.length} doctors found</ThemedText>
        {list.map((d) => <DoctorCard key={d.id} doctor={d} />)}
      </View>
    </Container>
  );
}
