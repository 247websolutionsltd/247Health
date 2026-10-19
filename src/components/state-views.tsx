import { Colors, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { MaterialIcons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";

export function LoadingView({ label = "Loading..." }: { label?: string }) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: "center", padding: Spacing.five }}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.two }}>{label}</ThemedText>
    </View>
  );
}

export function EmptyView({ icon = "inbox", title, message }: { icon?: ComponentProps<typeof MaterialIcons>["name"]; title: string; message?: string }) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: "center", padding: Spacing.five }}>
      <MaterialIcons name={icon} size={48} color={theme.inkSoft} />
      <ThemedText type="bold" style={{ marginTop: Spacing.two, textAlign: "center" }}>{title}</ThemedText>
      {message ? <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.one }}>{message}</ThemedText> : null}
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: "center", padding: Spacing.four }}>
      <MaterialIcons name="error-outline" size={44} color={Colors.danger} />
      <ThemedText style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.two }}>{message}</ThemedText>
      {onRetry ? (
        <TouchableOpacity onPress={onRetry} accessibilityRole="button" style={{ marginTop: Spacing.three, paddingVertical: Spacing.two, paddingHorizontal: Spacing.four, borderRadius: 999, backgroundColor: theme.accentSurface }}>
          <ThemedText type="smallBold" style={{ color: Colors.primary }}>Try again</ThemedText>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
