import Back from "@/components/back";
import Container from "@/components/custom-container";
import DoctorCard from "@/components/doctor-card";
import { EmptyView, ErrorView, LoadingView } from "@/components/state-views";
import { ThemedText } from "@/components/themed-text";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useCatalog } from "@/context/DataContext";
import { useTheme } from "@/hooks/use-theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, TextInput, TouchableOpacity, View } from "react-native";

export default function Doctors() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ query?: string; specialty?: string }>();
  const { specialties, doctors, loading, error, reload } = useCatalog();
  const [query, setQuery] = useState(params.query ?? "");
  const [specialtyId, setSpecialtyId] = useState(params.specialty ?? "all");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return doctors.filter(
      (d) =>
        (specialtyId === "all" || d.specialty_id === specialtyId) &&
        (!q || `${d.full_name} ${d.specialty_name} ${d.clinic_name}`.toLowerCase().includes(q)),
    );
  }, [doctors, query, specialtyId]);

  return (
    <Container edges={["top"]}>
      <View style={{ padding: Spacing.three }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Back />
          <ThemedText type="large">Find a doctor</ThemedText>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: theme.background, borderRadius: Radius.pill, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, marginTop: Spacing.three }}>
          <MaterialIcons name="search" size={20} color={theme.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search doctors or clinics"
            placeholderTextColor={theme.textSecondary}
            autoCorrect={false}
            returnKeyType="search"
            style={{ flex: 1, marginLeft: Spacing.two, color: theme.text, fontSize: 15 }}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} accessibilityLabel="Clear search">
              <MaterialIcons name="close" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.three }} style={{ flexGrow: 0 }}>
        {[{ id: "all", name: "All" }, ...specialties].map((s) => (
          <TouchableOpacity
            key={s.id}
            onPress={() => setSpecialtyId(s.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: specialtyId === s.id }}
            style={{ paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: Radius.pill, marginRight: Spacing.two, backgroundColor: specialtyId === s.id ? Colors.primary : theme.background }}
          >
            <ThemedText type="smallBold" style={{ color: specialtyId === s.id ? "#FFF" : theme.text }}>{s.name}</ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ padding: Spacing.three }}>
        {error && doctors.length === 0 ? (
          <ErrorView message={error} onRetry={() => void reload()} />
        ) : loading && doctors.length === 0 ? (
          <LoadingView label="Loading doctors..." />
        ) : list.length === 0 ? (
          <EmptyView icon="search-off" title="No doctors found" message="Try a different name or specialty." />
        ) : (
          <>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.three }}>
              {list.length} {list.length === 1 ? "doctor" : "doctors"} found
            </ThemedText>
            {list.map((d) => <DoctorCard key={d.id} doctor={d} />)}
          </>
        )}
      </View>
    </Container>
  );
}
