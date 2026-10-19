import Button from "@/components/button";
import Container from "@/components/custom-container";
import { Avatar } from "@/components/doctor-card";
import { ThemedText } from "@/components/themed-text";
import { Colors, Spacing } from "@/constants/theme";
import { useAppTheme, useAuth } from "@/context/PageContext";
import { useTheme } from "@/hooks/use-theme";
import { useStyles } from "@/styles/styles";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";

const profileActions = [
    { title: "Edit profile", subtitle: "Update your personal details", icon: "person-outline", route: "/account/edit-profile" as const },
    { title: "Security", subtitle: "Password and email verification", icon: "shield", route: "/account/security" as const },
    { title: "Help & support", subtitle: "Contact us and read the FAQs", icon: "support-agent", route: "/support" as const },
    { title: "Privacy policy", subtitle: "Read our privacy terms", icon: "privacy-tip", route: "/account/privacy-policy" as const },
] as const;

export default function Profile() {
    const styles = useStyles();
    const theme = useTheme();
    const { themeMode, setThemeMode } = useAppTheme();
    const { owner, user, signOut, loading, error: authError, clearError } = useAuth();
    const [feedback, setFeedback] = useState<string | null>(null);
    const handleSignOut = async () => {
        clearError();
        const error = await signOut();
        if (error) setFeedback(error);
        else router.replace("/auth/logIn");
    };

    return (
        <Container edges={["top"]}>
            <View style={{ padding: Spacing.three }}>
                <View style={[styles.rowStretch, { marginBottom: Spacing.three }]}>
                    <ThemedText type="large">Profile</ThemedText>
                    <TouchableOpacity onPress={() => router.push("/account/edit-profile")}>
                        <ThemedText type="small" style={{ color: theme.accentText }}>Edit</ThemedText>
                    </TouchableOpacity>
                </View>

                <View
                    style={{
                        backgroundColor: theme.background,
                        borderRadius: 22,
                        borderWidth: 1,
                        borderColor: theme.line,
                        padding: Spacing.three,
                    }}
                >
                    <View style={[styles.row, { marginBottom: Spacing.three }]}>
                        {owner.profileImage
                            ? <Image source={{ uri: owner.profileImage }} style={{ width: 72, height: 72, borderRadius: 24 }} />
                            : <Avatar name={owner.name} color={Colors.primary} size={72} />}
                        <View style={{ marginLeft: Spacing.three, flex: 1 }}>
                            <ThemedText type="bold">{owner.name}</ThemedText>
                            <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 2 }}>
                                {owner.title}
                            </ThemedText>
                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: Spacing.one }}>
                                <MaterialIcons name={user?.emailVerified ? "verified" : "mark-email-unread"} size={14} color={user?.emailVerified ? Colors.primary : Colors.warning} />
                                <ThemedText type="small" style={{ color: user?.emailVerified ? theme.accentText : theme.textSecondary, marginLeft: Spacing.one }}>
                                    {user?.emailVerified ? "Email verified" : "Email not verified"}
                                </ThemedText>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.rowStretch, { alignItems: "stretch" }]}>
                        {[
                            { label: "Blood type", value: owner.bloodType ?? "Not provided" },
                            { label: "Allergies", value: owner.allergies ?? "Not provided" },
                        ].map((item) => (
                            <View
                                key={item.label}
                                style={{
                                    flex: 1,
                                    backgroundColor: theme.accentSurface,
                                    borderRadius: 14,
                                    padding: Spacing.two,
                                    marginHorizontal: Spacing.half,
                                    alignItems: "center",
                                }}
                            >
                                <ThemedText type="small" style={{ color: theme.accentText }}>{item.label}</ThemedText>
                                <ThemedText type="smallBold" style={{ marginTop: Spacing.half, color: theme.accentText, textAlign: "center" }} numberOfLines={2}>
                                    {item.value}
                                </ThemedText>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            <View style={{ paddingHorizontal: Spacing.three, marginTop: Spacing.one }}>
                <View
                    style={{
                        backgroundColor: theme.background,
                        borderRadius: 18,
                        borderWidth: 1,
                        borderColor: theme.line,
                        marginBottom: Spacing.three,
                        overflow: "hidden",
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: Spacing.three,
                        }}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <View
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 12,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: theme.accentSurface,
                                }}
                            >
                                <MaterialIcons name={themeMode === "dark" ? "dark-mode" : "light-mode"} size={20} color={theme.accentText} />
                            </View>
                            <View style={{ marginLeft: Spacing.two }}>
                                <ThemedText type="smallBold">Appearance</ThemedText>
                                <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 2 }}>
                                    {themeMode === "dark" ? "Dark mode" : "Light mode"}
                                </ThemedText>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
                            style={{
                                width: 52,
                                height: 30,
                                borderRadius: 999,
                                backgroundColor: themeMode === "dark" ? Colors.primary : theme.controlOff,
                                paddingHorizontal: 4,
                                justifyContent: "center",
                                alignItems: themeMode === "dark" ? "flex-end" : "flex-start",
                            }}
                        >
                            <View style={{ width: 20, height: 20, borderRadius: 999, backgroundColor: theme.controlThumb }} />
                        </TouchableOpacity>
                    </View>
                </View>

                <ThemedText type="bold" style={{ marginBottom: Spacing.two }}>Account settings</ThemedText>
                <View
                    style={{
                        backgroundColor: theme.background,
                        borderRadius: 18,
                        borderWidth: 1,
                        borderColor: theme.line,
                        overflow: "hidden",
                    }}
                >
                    {profileActions.map((item, index) => (
                        <TouchableOpacity
                            key={item.title}
                            onPress={() => router.push(item.route)}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                padding: Spacing.three,
                                borderBottomWidth: index === profileActions.length - 1 ? 0 : 1,
                                borderBottomColor: theme.line,
                            }}
                        >
                            <View
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 12,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: theme.accentSurface,
                                }}
                            >
                                <MaterialIcons name={item.icon as any} size={20} color={theme.accentText} />
                            </View>
                            <View style={{ flex: 1, marginLeft: Spacing.two }}>
                                <ThemedText type="smallBold">{item.title}</ThemedText>
                                <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 2 }}>
                                    {item.subtitle}
                                </ThemedText>
                            </View>
                            <MaterialIcons name="chevron-right" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {(feedback || authError) && <ThemedText type="small" style={{ color: Colors.danger, marginHorizontal: Spacing.three }}>{feedback || authError}</ThemedText>}
            <Button
                title="Sign Out"
                onPress={handleSignOut}
                disabled={loading}
                type="secondary"
                style={{ margin: Spacing.three }}
                textColor={"#D65C5C"}
            />
        </Container>
    );
}