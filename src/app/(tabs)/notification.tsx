import Container from "@/components/custom-container";
import { EmptyView, ErrorView, LoadingView } from "@/components/state-views";
import { ThemedText } from "@/components/themed-text";
import { Colors, Spacing } from "@/constants/theme";
import { useNotifications } from "@/context/DataContext";
import { useTheme } from "@/hooks/use-theme";
import { formatDay, formatTime } from "@/lib/format";
import { useStyles } from "@/styles/styles";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { TouchableOpacity, View } from "react-native";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "appointment", label: "Visits" },
  { key: "account", label: "Account" },
] as const;

export default function Notification() {
  const theme = useTheme();
  const styles = useStyles();
  const { notifications, unreadCount, loading, error, markAllRead } = useNotifications();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");

  const list = useMemo(() => notifications.filter((n) => filter === "all" || n.type === filter), [notifications, filter]);

  return (
    <Container>
      <View style={{ padding: Spacing.three, paddingBottom: Spacing.two }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <ThemedText type="large">Notifications</ThemedText>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={() => void markAllRead()} accessibilityRole="button">
              <ThemedText type="small" style={{ color: theme.accentText }}>Mark all read</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ flexDirection: "row", gap: Spacing.two, marginTop: Spacing.three, flexWrap: "wrap" }}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === f.key }}
              style={{ paddingHorizontal: Spacing.three, paddingVertical: Spacing.one + 2, borderRadius: 999, backgroundColor: filter === f.key ? Colors.primary : theme.accentSurface }}
            >
              <ThemedText type="small" style={{ color: filter === f.key ? "#FFF" : theme.accentText }}>{f.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {error && notifications.length === 0 ? (
        <ErrorView message={error} />
      ) : loading && notifications.length === 0 ? (
        <LoadingView />
      ) : list.length === 0 ? (
        <EmptyView icon="notifications-none" title="You're all caught up" message="Appointment updates will show up here." />
      ) : (
        <View style={[styles.notificationCard]}>
          {list.map((n, i) => (
            <TouchableOpacity
              key={n.id}
              onPress={() => router.push(`/notifications/${n.id}` as never)}
              accessibilityRole="button"
              accessibilityLabel={`${n.title}${n.read ? "" : ", unread"}`}
              style={{ flexDirection: "row", alignItems: "center", padding: Spacing.three, borderBottomWidth: i === list.length - 1 ? 0 : 1, borderBottomColor: theme.line, backgroundColor: n.read ? "transparent" : theme.accentSurface }}
            >
              <MaterialIcons name={n.icon} size={25} color={n.read ? theme.textSecondary : Colors.primary} />
              <View style={{ flex: 1, marginLeft: Spacing.two }}>
                <ThemedText type="bold" style={{ fontWeight: n.read ? "500" : "700" }}>{n.title}</ThemedText>
                <ThemedText style={{ fontSize: 13, color: theme.textSecondary }}>{n.body}</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>{formatDay(n.created_at)} • {formatTime(n.created_at)}</ThemedText>
              </View>
              {!n.read && <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.primary, marginLeft: Spacing.two }} />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Container>
  );
}
