import { Colors, Radius, Spacing } from "@/constants/theme";
import { appointments } from "@/data/appointments";
import { doctors } from "@/data/doctors";
import { useStyles } from "@/styles/styles";
import { MaterialIcons } from "@expo/vector-icons";
import { View } from "react-native";
import { Avatar } from "./doctor-card";
import { ThemedText } from "./themed-text";

export default function NextAppointment(){
    const styles = useStyles();
    const next = appointments.find((a) => a.status === "upcoming")!;
    const nextDoc = doctors.find((d) => d.id === next.doctorId)!;
    return(
        <View style={{ marginHorizontal: Spacing.three, backgroundColor: Colors.primary, borderRadius: Radius.lg, padding: Spacing.three, overflow: "hidden" }}>
            <View style={{ position: "absolute", right: -40, top: -40, width: 170, height: 170, borderRadius: 85, backgroundColor: "rgba(255,255,255,0.10)" }} />
            <View style={{ position: "absolute", right: 40, bottom: -70, width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(255,255,255,0.07)" }} />
            <ThemedText type="small" style={{ color: "#DCEBFF" }}>Upcoming appointment</ThemedText>
            <View style={[styles.row, { marginTop: Spacing.three }]}>
            <View style={{ borderRadius: 22, borderWidth: 2, borderColor: "rgba(255,255,255,0.5)" }}>
                <Avatar name={nextDoc.name} color={Colors.primaryDark} size={58} />
            </View>
            <View style={{ marginLeft: Spacing.three, flex: 1 }}>
                <ThemedText type="bold" style={{ color: "#FFF" }}>{nextDoc.name}</ThemedText>
                <ThemedText type="small" style={{ color: "#DCEBFF" }}>{nextDoc.specialty} • {nextDoc.hospital}</ThemedText>
            </View>
            </View>
            <View style={[styles.rowStretch, { marginTop: Spacing.three, backgroundColor: "rgba(255,255,255,0.16)", borderRadius: Radius.sm, padding: Spacing.two, paddingHorizontal: Spacing.three }]}>
            <View style={styles.row}>
                <MaterialIcons name="event" size={18} color="#FFF" />
                <ThemedText type="smallBold" style={{ color: "#FFF", marginLeft: Spacing.one }}>{next.date}</ThemedText>
            </View>
            <View style={styles.row}>
                <MaterialIcons name="schedule" size={18} color="#FFF" />
                <ThemedText type="smallBold" style={{ color: "#FFF", marginLeft: Spacing.one }}>{next.time}</ThemedText>
            </View>
            </View>
        </View>
    )
}