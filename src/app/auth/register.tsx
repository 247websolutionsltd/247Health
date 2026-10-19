import AuthHeader from "@/components/auth-header";
import Button from "@/components/button";
import Container from "@/components/custom-container";
import Input from "@/components/custom-input";
import { ThemedText } from "@/components/themed-text";
import { Colors, Radius, Shadow, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/PageContext";
import { useTheme } from "@/hooks/use-theme";
import { useStyles } from "@/styles/styles";
import { router } from "expo-router";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";

export default function Register() {
  const styles = useStyles();
  const theme = useTheme();
  const { registerForm, updateRegisterField, handleSignup, loading, error: authError, clearError } = useAuth();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackIsError, setFeedbackIsError] = useState(true);

  const handleRegister = async () => {
    clearError();
    setFeedback(null);
    if (registerForm.password !== registerForm.confirm) {
      setFeedback("Passwords do not match.");
      setFeedbackIsError(true);
      return;
    }
    if (!registerForm.name.trim() || !registerForm.phone.trim() || !registerForm.email.trim() || !registerForm.password) {
      setFeedback("Enter your name, phone, email, and password to continue.");
      setFeedbackIsError(true);
      return;
    }
    if (registerForm.password.length < 8) {
      setFeedback("Choose a password with at least 8 characters.");
      setFeedbackIsError(true);
      return;
    }
    await handleSignup();
  };

  return (
    <Container edges={[]}>
      <AuthHeader title="Create account" subtitle="Join CareNest and book care in minutes" />

      <View style={[{ marginHorizontal: Spacing.three, marginTop: -28, backgroundColor: theme.background, borderRadius: Radius.lg, padding: Spacing.three }, Shadow]}>
        <Input label="Full name" placeholder="Jane Doe" value={registerForm.name} autoComplete="name" textContentType="name" onChangeText={(t) => updateRegisterField("name", t)} />
        <Input label="Phone" placeholder="08012345678" number value={registerForm.phone} autoComplete="tel" textContentType="telephoneNumber" onChangeText={(t) => updateRegisterField("phone", t)} />
        <Input label="Email" placeholder="you@example.com" value={registerForm.email} autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" keyboardType="email-address" onChangeText={(t) => updateRegisterField("email", t)} />
        <Input label="Password" placeholder="Create a password" password value={registerForm.password} autoComplete="new-password" textContentType="newPassword" onChangeText={(t) => updateRegisterField("password", t)} />
        <Input label="Confirm password" placeholder="Repeat your password" password value={registerForm.confirm} autoComplete="new-password" textContentType="newPassword" onChangeText={(t) => updateRegisterField("confirm", t)} />
        {(feedback || authError) && <ThemedText type="small" style={{ color: feedbackIsError ? Colors.danger : Colors.success, marginBottom: Spacing.two }}>{feedback || authError}</ThemedText>}
        <View style={{ marginTop: Spacing.two }}>
          <Button onPress={handleRegister} title="Create account" disabled={loading} />
        </View>
      </View>

      <View style={[styles.row, { justifyContent: "center", marginTop: Spacing.three }]}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>Already have an account? </ThemedText>
        <TouchableOpacity onPress={() => router.push("/auth/logIn")}>
          <ThemedText type="smallBold" style={{ color: Colors.primary }}>Sign in</ThemedText>
        </TouchableOpacity>
      </View>
    </Container>
  );
}
