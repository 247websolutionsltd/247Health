import Back from "@/components/back";
import Button from "@/components/button";
import Container from "@/components/custom-container";
import { EmptyView, LoadingView } from "@/components/state-views";
import { ThemedText } from "@/components/themed-text";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useNotifications } from "@/context/DataContext";
import { useTheme } from "@/hooks/use-theme";
import { formatDay, formatTime } from "@/lib/format";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

export default function NotificationDetail() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notifications, loading, markRead } = useNotifications();
  const n = notifications.find((item) => item.id === id);
  const needsMarking = Boolean(n && !n.read);

  useEffect(() => {
    if (n && needsMarking) void markRead(n.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n?.id, needsMarking]);

  return (
    <Container edges={["top"]}>
      <View style={{ padding: Spacing.three }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: Spacing.three }}>
          <Back icon="arrow-back" />
          <ThemedText type="large">Notification</ThemedText>
        </View>

        {!n ? (
          loading ? <LoadingView /> : <EmptyView icon="notifications-off" title="Notification not found" message="It may have been removed." />
        ) : (
          <View style={{ backgroundColor: theme.background, borderRadius: Radius.md, borderWidth: 1, borderColor: theme.line, padding: Spacing.three }}>
            <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: theme.accentSurface, alignItems: "center", justifyContent: "center" }}>
              <MaterialIcons name={n.icon} size={26} color={Colors.primary} />
            </View>
            <ThemedText type="subtitle" style={{ marginTop: Spacing.three }}>{n.title}</ThemedText>
            <ThemedText style={{ color: theme.textSecondary, marginTop: Spacing.one, lineHeight: 22 }}>{n.body}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.three }}>
              {formatDay(n.created_at)} at {formatTime(n.created_at)}
            </ThemedText>
            {n.appointment_id && (
              <Button title="View appointments" onPress={() => router.push("/(tabs)/appointments")} isLoading={false} style={{ marginTop: Spacing.three }} />
            )}
          </View>
        )}
      </View>
    </Container>
  );
}
