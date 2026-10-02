import Container from "@/components/custom-container";
import NotificationCard from "@/components/notification";
import { ThemedText } from "@/components/themed-text";
import { Colors, Spacing } from "@/constants/theme";
import notifications from "@/data/notifications";
import { useTheme } from "@/hooks/use-theme";
import { useStyles } from "@/styles/styles";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";

const filters = ["All", "Visits", "Results", "Reminders"];

export default function Notification() {
    const theme = useTheme();
    const styles = useStyles();
    const [selectedFilter, setSelectedFilter] = useState("All");
    const [allMarked, setAllMarked] = useState(false);
    return (
        <Container>
            <View style={{ padding: Spacing.three, paddingBottom: Spacing.two }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <ThemedText type="large">Notifications</ThemedText>
                    <TouchableOpacity onPress={() => setAllMarked(true)}>
                        <ThemedText type="small" style={{ color: theme.accentText }}>{allMarked ? "All marked" : "Mark all"}</ThemedText>
                    </TouchableOpacity>
                </View>

                <View style={{ flexDirection: "row", gap: Spacing.two, marginTop: Spacing.three, flexWrap: "wrap" }}>
                    {filters.map((item, index) => (
                        <TouchableOpacity
                            key={item}
                            onPress={() => setSelectedFilter(item)}
                            style={{
                                paddingHorizontal: Spacing.two,
                                paddingVertical: Spacing.one,
                                borderRadius: 999,
                                backgroundColor: selectedFilter === item ? Colors.primary : theme.accentSurface,
                            }}
                        >
                            <ThemedText type="small" style={{ color: selectedFilter === item ? "#FFF" : theme.accentText }}>
                                {item}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={{ paddingHorizontal: Spacing.three, marginBottom: Spacing.two }}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>Today</ThemedText>
            </View>

            <FlatList
                data={notifications}
                scrollEnabled={false}
                renderItem={({ item, index }) => (
                    <View
                        key={`${item.title}-${index}`}
                        style={[styles.notificationCard, {
                            backgroundColor: index === 0 ? theme.accentSurface : theme.background,
                            marginBottom: index === notifications.length - 1 ? 0 : Spacing.two,
                        }]}
                    >
                        <NotificationCard
                            icon={item.icon}
                            title={item.title}
                            desc={item.desc}
                            end={index === notifications.length - 1}
                            onPress={() => router.push(`/notifications/${index}` as never)}
                        />
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: Spacing.three }}
                keyExtractor={(item, index) => `${item.title}-${index}`}
            />

            <View style={{ paddingHorizontal: Spacing.three, paddingTop: Spacing.three, flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                <MaterialIcons name="notifications-active" size={18} color={theme.accentText} />
                <ThemedText type="small" style={{ marginLeft: Spacing.one, color: theme.accentText }}>
                    Alerts enabled
                </ThemedText>
            </View>
        </Container>
    );
}