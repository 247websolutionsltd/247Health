import Back from "@/components/back";
import Button from "@/components/button";
import Container from "@/components/custom-container";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import notifications from "@/data/notifications";
import { useTheme } from "@/hooks/use-theme";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function NotificationDetail() {
  const theme = useTheme();
  const { id = "0" } = useLocalSearchParams<{ id?: string }>();
  const notification = notifications[Number(id)] ?? notifications[0];
  const hasOrderAction = notification.title.toLowerCase().includes("appointment");
  return( 
    <Container edges={["top"]}>
      <View style={{ padding: Spacing.three }}>
        <Back/>
        <View style={{ alignItems: "center", marginTop: Spacing.five }}>
          <View style={{ width: 68, height: 68, borderRadius: 22, backgroundColor: theme.accentSurface, alignItems: "center", justifyContent: "center" }}>
            <MaterialIcons name={notification.icon} size={30} color={theme.accentText} />
          </View>
          <ThemedText type="large" style={{ textAlign: "center", marginTop: Spacing.three }}>
            {notification.title}
          </ThemedText>
          <ThemedText style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.two, lineHeight: 22 }}>
            {notification.desc} We’ll keep you updated as your care journey moves forward.
          </ThemedText>
        </View>
        <View style={{ marginTop: Spacing.four, backgroundColor: theme.accentSurface, borderRadius: 18, padding: Spacing.three }}>
          <ThemedText type="small" style={{ color: theme.accentText }}>
            Notification details
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.two, lineHeight: 22 }}>
            This notification was sent today to keep your account and appointment activity up to date.
          </ThemedText>
        </View>
        {
          hasOrderAction && 
          <Button title="View appointment" onPress={() => router.push("/(tabs)/appointments" as never)} style={{ marginTop: Spacing.three }} />
        }
      </View>
    </Container>
  )
}