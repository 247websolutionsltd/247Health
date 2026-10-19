import { Colors, Spacing } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { View } from "react-native";
import { ThemedText } from "./themed-text";

export default function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={{ backgroundColor: Colors.primary, paddingTop: 72, paddingBottom: 56, paddingHorizontal: Spacing.four, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: "hidden" }}>
      <View style={{ position: "absolute", top: -60, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,255,255,0.10)" }} />
      <View style={{ position: "absolute", bottom: -70, left: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(255,255,255,0.07)" }} />
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: "#FFF", alignItems: "center", justifyContent: "center" }}>
          <MaterialIcons name="health-and-safety" size={26} color={Colors.primary} />
        </View>
        <ThemedText type="bold" style={{ color: "#FFF", marginLeft: Spacing.two, fontSize: 20 }}>CareNest</ThemedText>
      </View>
      <ThemedText type="title" style={{ color: "#FFF", marginTop: Spacing.four }}>{title}</ThemedText>
      <ThemedText style={{ color: "#DCEBFF", marginTop: Spacing.one }}>{subtitle}</ThemedText>
    </View>
  );
}
