import AuthHeader from "@/components/auth-header";
import Button from "@/components/button";
import Container from "@/components/custom-container";
import Input from "@/components/custom-input";
import { ThemedText } from "@/components/themed-text";
import { Colors, Radius, Shadow, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/PageContext";
import { useTheme } from "@/hooks/use-theme";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";

export default function Forgot() {
  const theme = useTheme();
  const { logInForm, updateLogInField, sendPasswordReset, loading, error: authError, clearError } = useAuth();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const handleSend = async () => {
    clearError();
    setFeedback(null);
    const email = logInForm.email.trim();
    const error = await sendPasswordReset(email);
    if (error) setFeedback(error);
    else setSentTo(email);
  };

  return (
    <Container edges={[]}>
      <AuthHeader title="Reset password" subtitle="We'll email you a link to choose a new one" />

      <View style={[{ marginHorizontal: Spacing.three, marginTop: -28, backgroundColor: theme.background, borderRadius: Radius.lg, padding: Spacing.three }, Shadow]}>
        {sentTo ? (
          <View style={{ alignItems: "center", paddingVertical: Spacing.two }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: theme.accentSurface, alignItems: "center", justifyContent: "center" }}>
              <MaterialIcons name="mark-email-read" size={32} color={Colors.primary} />
            </View>
            <ThemedText type="bold" style={{ marginTop: Spacing.three }}>Check your email</ThemedText>
            <ThemedText style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.one, lineHeight: 22 }}>
              If an account exists for {sentTo}, a password reset link is on its way. It may take a minute, and it can land in spam.
            </ThemedText>
            <View style={{ alignSelf: "stretch", marginTop: Spacing.three }}>
              <Button title="Back to sign in" onPress={() => router.replace("/auth/logIn")} isLoading={false} />
            </View>
            <TouchableOpacity onPress={() => setSentTo(null)} style={{ padding: Spacing.three }}>
              <ThemedText type="smallBold" style={{ color: Colors.primary }}>Use a different email</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Input label="Email" placeholder="you@example.com" value={logInForm.email} autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" keyboardType="email-address" onChangeText={(t) => updateLogInField("email", t)} />
            {(feedback || authError) && <ThemedText type="small" style={{ color: Colors.danger, marginVertical: Spacing.two }}>{feedback || authError}</ThemedText>}
            <View style={{ marginTop: Spacing.two }}>
              <Button title="Send reset link" onPress={handleSend} disabled={loading} />
            </View>
          </>
        )}
      </View>

      {!sentTo && (
        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: Spacing.three }}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>Remembered it? </ThemedText>
          <TouchableOpacity onPress={() => router.replace("/auth/logIn")}>
            <ThemedText type="smallBold" style={{ color: Colors.primary }}>Sign in</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </Container>
  );
}
