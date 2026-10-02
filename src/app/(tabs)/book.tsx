import Back from "@/components/back";
import Button from "@/components/button";
import Container from "@/components/custom-container";
import Input from "@/components/custom-input";
import { Avatar } from "@/components/doctor-card";
import { ThemedText } from "@/components/themed-text";
import { Colors, Radius, Shadow, Spacing } from "@/constants/theme";
import { doctors, timeSlots } from "@/data/doctors";
import { useTheme } from "@/hooks/use-theme";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function Book() {
  const theme = useTheme();
  const { doctorId } = useLocalSearchParams<{ doctorId?: string }>();
  const [docId, setDocId] = useState(doctorId ?? doctors[0].id);
  const doctor = doctors.find((d) => d.id === docId)!;
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [mode, setMode] = useState<"In-person" | "Video call">("In-person");
  const [reason, setReason] = useState("");

  const days = useMemo(
    () => Array.from({ length: 10 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i + 1); return d; }),
    []
  );

  const confirm = () => {
    const d = days[dayIdx];
    router.replace({
      pathname: "/booking-confirmation",
      params: { doctorId: docId, date: `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`, time: slot ?? "", mode },
    } as never);
  };

  const Label = ({ children }: { children: string }) => (
    <ThemedText type="bold" style={{ marginTop: Spacing.four, marginBottom: Spacing.two }}>{children}</ThemedText>
  );

  return (
    <Container edges={["top"]}>
      <View style={{ padding: Spacing.three }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Back />
          <ThemedText type="large">Book appointment</ThemedText>
        </View>

        {/* Doctor selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: Spacing.three }}>
          {doctors.filter((d) => d.available).map((d) => (
            <TouchableOpacity key={d.id} onPress={() => setDocId(d.id)} style={[{ alignItems: "center", marginRight: Spacing.three, padding: Spacing.two, borderRadius: Radius.md, backgroundColor: docId === d.id ? theme.accentSurface : "transparent", borderWidth: 2, borderColor: docId === d.id ? Colors.primary : "transparent" }]}>
              <Avatar name={d.name} color={d.color} size={52} />
              <ThemedText type="small" style={{ fontSize: 12, marginTop: 4 }}>{d.name.replace("Dr. ", "").split(" ")[0]}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.one }}>{doctor.name} • {doctor.specialty} • {doctor.fee}</ThemedText>

        <Label>Select date</Label>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {days.map((d, i) => (
            <TouchableOpacity key={i} onPress={() => setDayIdx(i)} style={[{ width: 62, paddingVertical: Spacing.three, alignItems: "center", borderRadius: Radius.md, marginRight: Spacing.two, backgroundColor: dayIdx === i ? Colors.primary : theme.background }, dayIdx === i ? {} : Shadow]}>
              <ThemedText type="small" style={{ color: dayIdx === i ? "#DCEBFF" : theme.textSecondary }}>{DAYS[d.getDay()]}</ThemedText>
              <ThemedText type="bold" style={{ color: dayIdx === i ? "#FFF" : theme.text, marginTop: 2 }}>{d.getDate()}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Label>Available time</Label>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: Spacing.two }}>
          {timeSlots.map((t) => (
            <TouchableOpacity key={t} onPress={() => setSlot(t)} style={{ width: "31%", paddingVertical: Spacing.two + 2, alignItems: "center", borderRadius: Radius.pill, backgroundColor: slot === t ? Colors.primary : theme.background, borderWidth: 1, borderColor: slot === t ? Colors.primary : theme.line }}>
              <ThemedText type="small" style={{ color: slot === t ? "#FFF" : theme.text }}>{t}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <Label>Consultation type</Label>
        <View style={{ flexDirection: "row", gap: Spacing.two }}>
          {(["In-person", "Video call"] as const).map((m) => (
            <TouchableOpacity key={m} onPress={() => setMode(m)} style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", padding: Spacing.three, borderRadius: Radius.md, backgroundColor: mode === m ? theme.accentSurface : theme.background, borderWidth: 2, borderColor: mode === m ? Colors.primary : theme.line }}>
              <MaterialIcons name={m === "Video call" ? "videocam" : "local-hospital"} size={20} color={Colors.primary} />
              <ThemedText type="smallBold" style={{ marginLeft: Spacing.two }}>{m}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <Input label="Reason for visit (optional)" placeholder="Describe your symptoms" desc value={reason} onChangeText={setReason} />

        <Button title="Confirm booking" disabled={!slot} onPress={confirm} isLoading={false} style={{ marginTop: Spacing.two }} />
      </View>
    </Container>
  );
}
