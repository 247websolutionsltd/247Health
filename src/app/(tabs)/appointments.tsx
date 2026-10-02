import Container from "@/components/custom-container";
import { Avatar } from "@/components/doctor-card";
import { ThemedText } from "@/components/themed-text";
import { Colors, Radius, Shadow, Spacing } from "@/constants/theme";
import { appointments } from "@/data/appointments";
import { doctors } from "@/data/doctors";
import { useTheme } from "@/hooks/use-theme";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";

const tabs = ["upcoming", "completed", "cancelled"] as const;
const statusColor = { upcoming: Colors.primary, completed: Colors.success, cancelled: Colors.danger };

export default function Appointments() {
  const theme = useTheme();
  const [tab, setTab] = useState<(typeof tabs)[number]>("upcoming");
  const list = appointments.filter((a) => a.status === tab);

  return (
    <Container edges={["top"]}>
      <View style={{ padding: Spacing.three }}>
        <ThemedText type="large">My appointments</ThemedText>

        <View style={{ flexDirection: "row", backgroundColor: theme.backgroundElement, borderRadius: Radius.pill, padding: 4, marginTop: Spacing.three }}>
          {tabs.map((t) => (
            <TouchableOpacity key={t} onPress={() => setTab(t)} style={{ flex: 1, paddingVertical: Spacing.two, borderRadius: Radius.pill, alignItems: "center", backgroundColor: tab === t ? Colors.primary : "transparent" }}>
              <ThemedText type="smallBold" style={{ color: tab === t ? "#FFF" : theme.textSecondary, textTransform: "capitalize" }}>{t}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ marginTop: Spacing.three }}>
          {list.length === 0 && (
            <View style={{ alignItems: "center", padding: Spacing.five }}>
              <MaterialIcons name="event-busy" size={48} color={theme.inkSoft} />
              <ThemedText style={{ color: theme.textSecondary, marginTop: Spacing.two }}>Nothing here yet</ThemedText>
            </View>
          )}
          {list.map((a) => {
            const d = doctors.find((x) => x.id === a.doctorId)!;
            return (
              <View key={a.id} style={[{ backgroundColor: theme.background, borderRadius: Radius.md, padding: Spacing.three, marginBottom: Spacing.three }, Shadow]}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Avatar name={d.name} color={d.color} size={54} />
                  <View style={{ flex: 1, marginLeft: Spacing.three }}>
                    <ThemedText type="bold">{d.name}</ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>{d.specialty}</ThemedText>
                  </View>
                  <View style={{ backgroundColor: theme.accentSurface, borderRadius: 999, paddingHorizontal: Spacing.two, paddingVertical: 2 }}>
                    <ThemedText type="small" style={{ fontSize: 11, color: statusColor[a.status], textTransform: "capitalize" }}>{a.status}</ThemedText>
                  </View>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: theme.paper, borderRadius: Radius.sm, padding: Spacing.two, paddingHorizontal: Spacing.three, marginTop: Spacing.three }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MaterialIcons name="event" size={16} color={Colors.primary} />
                    <ThemedText type="small" style={{ marginLeft: Spacing.one }}>{a.date}</ThemedText>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MaterialIcons name="schedule" size={16} color={Colors.primary} />
                    <ThemedText type="small" style={{ marginLeft: Spacing.one }}>{a.time}</ThemedText>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MaterialIcons name={a.type === "Video call" ? "videocam" : "local-hospital"} size={16} color={Colors.primary} />
                    <ThemedText type="small" style={{ marginLeft: Spacing.one }}>{a.type}</ThemedText>
                  </View>
                </View>
                {a.status === "upcoming" && (
                  <View style={{ flexDirection: "row", marginTop: Spacing.three, gap: Spacing.two }}>
                    <TouchableOpacity style={{ flex: 1, height: 44, borderRadius: Radius.pill, borderWidth: 1, borderColor: theme.line, alignItems: "center", justifyContent: "center" }}>
                      <ThemedText type="smallBold">Cancel</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push({ pathname: "/(tabs)/book", params: { doctorId: d.id } } as never)} style={{ flex: 1, height: 44, borderRadius: Radius.pill, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" }}>
                      <ThemedText type="smallBold" style={{ color: "#FFF" }}>Reschedule</ThemedText>
                    </TouchableOpacity>
                  </View>
                )}
                {a.status !== "upcoming" && (
                  <TouchableOpacity onPress={() => router.push({ pathname: "/(tabs)/book", params: { doctorId: d.id } } as never)} style={{ marginTop: Spacing.three, height: 44, borderRadius: Radius.pill, backgroundColor: theme.accentSurface, alignItems: "center", justifyContent: "center" }}>
                    <ThemedText type="smallBold" style={{ color: Colors.primary }}>Book again</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </Container>
  );
}
