import { Colors, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { MaterialIcons } from "@expo/vector-icons";
import { Dimensions, StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";

const { width, height } = Dimensions.get("window");

const OnboardingItem = ({ item }: any) => {
  const theme = useTheme();
  return (
    <View style={[styles.container, { width, backgroundColor: theme.paper }]}>
      <View style={[styles.hero, { height: Math.min(height * 0.48, 400) }]}>
        <View style={[styles.blob, { top: -50, right: -40, width: 200, height: 200, borderRadius: 100 }]} />
        <View style={[styles.blob, { bottom: -60, left: -40, width: 220, height: 220, borderRadius: 110 }]} />
        <View style={styles.iconRing}>
          <View style={styles.iconCore}>
            <MaterialIcons name={item.icon} size={64} color={Colors.primary} />
          </View>
        </View>
        <View style={styles.counter}>
          <ThemedText type="smallBold" style={{ color: "#FFF" }}>{item.id} / 3</ThemedText>
        </View>
      </View>

      <View style={styles.copy}>
        <ThemedText type="smallBold" style={{ color: Colors.primary, letterSpacing: 1.2 }}>{item.eyebrow}</ThemedText>
        <ThemedText type="large" style={styles.title}>{item.title}</ThemedText>
        <ThemedText style={{ color: theme.textSecondary, marginTop: Spacing.two, lineHeight: 23 }}>{item.description}</ThemedText>
      </View>
    </View>
  );
};

export default OnboardingItem;

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing.three, paddingTop: Spacing.six },
  hero: { backgroundColor: Colors.primary, borderRadius: Radius.lg, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  blob: { position: "absolute", backgroundColor: "rgba(255,255,255,0.10)" },
  iconRing: { width: 190, height: 190, borderRadius: 95, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  iconCore: { width: 140, height: 140, borderRadius: 70, backgroundColor: "#FFF", alignItems: "center", justifyContent: "center" },
  counter: { position: "absolute", top: Spacing.three, right: Spacing.three, backgroundColor: "rgba(8,24,56,0.35)", paddingHorizontal: Spacing.two, paddingVertical: Spacing.one, borderRadius: Radius.pill },
  copy: { paddingHorizontal: Spacing.one, paddingTop: Spacing.four },
  title: { lineHeight: 36, marginTop: Spacing.one },
});
