import Back from "@/components/back";
import Button from "@/components/button";
import Container from "@/components/custom-container";
import Input from "@/components/custom-input";
import { ThemedText } from "@/components/themed-text";
import { Colors, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/PageContext";
import { useTheme } from "@/hooks/use-theme";
import { useStyles } from "@/styles/styles";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";

export default function Security() {
  const theme = useTheme();
  const styles = useStyles();
  const { user, loading, error: authError, clearError, changePassword, resendVerification, refreshUser } = useAuth();
  const hasPassword = user?.providerIds.includes("password") ?? false;

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);
  const [verifyNote, setVerifyNote] = useState<string | null>(null);

  const card = { backgroundColor: theme.background, borderRadius: 18, borderWidth: 1, borderColor: theme.line, padding: Spacing.three, marginBottom: Spacing.three } as const;

  const submitPassword = async () => {
    clearError();
    setFeedback(null);
    if (!current || !next || !confirm) return setFeedback({ text: "Fill in all three password fields.", ok: false });
    if (next.length < 8) return setFeedback({ text: "Choose a new password with at least 8 characters.", ok: false });
    if (next !== confirm) return setFeedback({ text: "The new passwords don't match.", ok: false });
    if (next === current) return setFeedback({ text: "Your new password must be different from the current one.", ok: false });
    const error = await changePassword(current, next);
    if (error) return setFeedback({ text: error, ok: false });
    setCurrent(""); setNext(""); setConfirm("");
    setFeedback({ text: "Your password has been changed.", ok: true });
  };

  const resend = async () => {
    clearError();
    setVerifyNote(null);
    const error = await resendVerification();
    setVerifyNote(error ?? "Verification email sent. Open the link in it, then tap \"I've verified\".");
  };

  const recheck = async () => {
    clearError();
    const error = await refreshUser();
    setVerifyNote(error ?? null);
  };

  return (
    <Container edges={["top"]}>
      <View style={{ padding: Spacing.three }}>
        <View style={[styles.row, { marginBottom: Spacing.three }]}>
          <Back icon="arrow-back" />
          <ThemedText type="large">Security</ThemedText>
        </View>

        <View style={card}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>Signed in as</ThemedText>
          <ThemedText type="bold">{user?.email ?? "Unknown"}</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.one }}>
            Sign-in method: {hasPassword ? "Email and password" : "Google"}
          </ThemedText>

          <View style={{ flexDirection: "row", alignItems: "center", marginTop: Spacing.three }}>
            <MaterialIcons name={user?.emailVerified ? "verified-user" : "warning-amber"} size={20} color={user?.emailVerified ? Colors.success : Colors.warning} />
            <ThemedText type="smallBold" style={{ marginLeft: Spacing.two }}>
              {user?.emailVerified ? "Email verified" : "Email not verified"}
            </ThemedText>
          </View>
          {!user?.emailVerified && (
            <View style={{ marginTop: Spacing.two }}>
              <ThemedText type="small" style={{ color: theme.textSecondary, lineHeight: 20 }}>
                Verifying your email helps you recover your account if you forget your password.
              </ThemedText>
              <View style={{ flexDirection: "row", gap: Spacing.three, marginTop: Spacing.two }}>
                <TouchableOpacity onPress={resend} disabled={loading} accessibilityRole="button">
                  <ThemedText type="smallBold" style={{ color: Colors.primary }}>Resend email</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={recheck} disabled={loading} accessibilityRole="button">
                  <ThemedText type="smallBold" style={{ color: Colors.primary }}>I've verified</ThemedText>
                </TouchableOpacity>
              </View>
              {verifyNote && <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.two }}>{verifyNote}</ThemedText>}
            </View>
          )}
        </View>

        {hasPassword ? (
          <View style={card}>
            <ThemedText type="bold">Change password</ThemedText>
            <Input label="Current password" password value={current} onChangeText={setCurrent} autoComplete="current-password" textContentType="password" />
            <Input label="New password" password value={next} onChangeText={setNext} autoComplete="new-password" textContentType="newPassword" placeholder="At least 8 characters" />
            <Input label="Confirm new password" password value={confirm} onChangeText={setConfirm} autoComplete="new-password" textContentType="newPassword" />
            {(feedback || authError) && (
              <ThemedText type="small" style={{ color: feedback?.ok ? Colors.success : Colors.danger, marginVertical: Spacing.two }}>
                {feedback?.text ?? authError}
              </ThemedText>
            )}
            <Button title="Update password" onPress={submitPassword} disabled={loading} style={{ marginTop: Spacing.two }} />
          </View>
        ) : (
          <View style={card}>
            <ThemedText type="small" style={{ color: theme.textSecondary, lineHeight: 20 }}>
              You sign in with Google, so there's no password to manage here. Manage your Google account security from your Google settings.
            </ThemedText>
          </View>
        )}
      </View>
    </Container>
  );
}
