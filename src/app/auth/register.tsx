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
import { TouchableOpacity, View } from "react-native";

export default function Register() {
  const styles = useStyles();
  const theme = useTheme();
  const { updateRegisterField } = useAuth();

  return (
    <Container edges={[]}>
      <AuthHeader title="Create account" subtitle="Join CareNest and book care in minutes" />

      <View style={[{ marginHorizontal: Spacing.three, marginTop: -28, backgroundColor: theme.background, borderRadius: Radius.lg, padding: Spacing.three }, Shadow]}>
        <Input label="Full name" placeholder="Jane Doe" onChangeText={(t) => updateRegisterField("name", t)} />
        <Input label="Phone" placeholder="08012345678" number onChangeText={(t) => updateRegisterField("phone", t)} />
        <Input label="Email" placeholder="you@example.com" onChangeText={(t) => updateRegisterField("email", t)} />
        <Input label="Password" placeholder="Create a password" password onChangeText={(t) => updateRegisterField("password", t)} />
        <Input label="Confirm password" placeholder="Repeat your password" password onChangeText={(t) => updateRegisterField("confirm", t)} />
        <View style={{ marginTop: Spacing.two }}>
          <Button onPress={() => router.replace("/(tabs)/home")} title="Create account" />
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
