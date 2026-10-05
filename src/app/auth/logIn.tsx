import AuthHeader from "@/components/auth-header";
import Button from "@/components/button";
import Container from "@/components/custom-container";
import Input from "@/components/custom-input";
import { ThemedText } from "@/components/themed-text";
import { Colors, Radius, Shadow, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/PageContext";
import { useTheme } from "@/hooks/use-theme";
import { useStyles } from "@/styles/styles";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";

export default function LogIn() {
  const styles = useStyles();
  const theme = useTheme();
  const { logInForm, updateLogInField, signIn, signInWithGoogle, loading, error: authError, clearError } = useAuth();
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSignIn = async () => {
    clearError();
    setFeedback(null);
    const error = await signIn(logInForm.email, logInForm.password);
    if (error) setFeedback(error);
    else router.replace("/");
  };

  const handleGoogleSignIn = async () => {
    clearError();
    setFeedback(null);
    const result = await signInWithGoogle();
    if (result.type === "cancelled") setFeedback("Google sign-in was cancelled.");
    else if (result.type === "error") setFeedback(result.message);
    else if (result.type === "success") router.replace("/");
  };

  return (
    <Container edges={[]}>
      <AuthHeader title="Welcome back" subtitle="Sign in to manage your appointments" />

      <View style={[{ marginHorizontal: Spacing.three, marginTop: -28, backgroundColor: theme.background, borderRadius: Radius.lg, padding: Spacing.three }, Shadow]}>
        <Input label="Email" placeholder="you@example.com" value={logInForm.email} autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" keyboardType="email-address" onChangeText={(t) => updateLogInField("email", t)} />
        <Input label="Password" placeholder="Enter your password" password value={logInForm.password} autoComplete="current-password" textContentType="password" onChangeText={(t) => updateLogInField("password", t)} />
        <TouchableOpacity onPress={() => router.push("/auth/forgot")} style={{ alignSelf: "flex-end", marginVertical: Spacing.two }}>
          <ThemedText type="smallBold" style={{ color: Colors.primary }}>Forgot password?</ThemedText>
        </TouchableOpacity>
        {(feedback || authError) && <ThemedText type="small" style={{ color: Colors.danger, marginBottom: Spacing.two }}>{feedback || authError}</ThemedText>}
        <Button onPress={handleSignIn} title="Sign in" disabled={loading} />
      </View>

      <View style={[styles.row, { marginTop: Spacing.four, paddingHorizontal: Spacing.three }]}>
        <View style={styles.line} />
        <ThemedText type="small" style={{ padding: Spacing.two, color: theme.textSecondary }}>or continue with</ThemedText>
        <View style={styles.line} />
      </View>

      <View style={styles.socialRow}>
        <TouchableOpacity style={[styles.socialBtn, { opacity: loading ? 0.5 : 1 }]} onPress={handleGoogleSignIn} disabled={loading} accessibilityRole="button">
          <MaterialIcons name="g-translate" size={20} color={Colors.primary} />
          <ThemedText type="smallBold" style={{ marginLeft: Spacing.two }}>Google</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn}>
          <MaterialIcons name="fingerprint" size={20} color={Colors.primary} />
          <ThemedText type="smallBold" style={{ marginLeft: Spacing.two }}>Biometric</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={[styles.row, { justifyContent: "center", marginTop: Spacing.two }]}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>New to CareNest? </ThemedText>
        <TouchableOpacity onPress={() => router.push("/auth/register")}>
          <ThemedText type="smallBold" style={{ color: Colors.primary }}>Create account</ThemedText>
        </TouchableOpacity>
      </View>
    </Container>
  );
}
