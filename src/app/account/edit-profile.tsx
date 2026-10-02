import Back from "@/components/back";
import Button from "@/components/button";
import Container from "@/components/custom-container";
import Input from "@/components/custom-input";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useAuth } from "@/context/PageContext";
import { useTheme } from "@/hooks/use-theme";
import { useStyles } from "@/styles/styles";
import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

export default function EditProfile() {
  const styles = useStyles();
  const theme = useTheme();
  const { owner } = useAuth();
  const [name, setName] = useState(owner.name);
  const [email, setEmail] = useState(owner.email);
  const [phone, setPhone] = useState(owner.phone);

  return (
    <Container edges={["top"]}>
      <View style={{ padding: Spacing.three }}>
        <View style={[styles.row, {marginBottom:Spacing.three}]}>
            <Back icon="arrow-back"/>
            <ThemedText type="large" style={{ marginTop: Spacing.three, marginBottom: Spacing.two }}>
            Edit profile
            </ThemedText>
        </View>
        <View
          style={{
            backgroundColor: theme.background,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: theme.line,
            padding: Spacing.three,
          }}
        >
          <Input label="Full name" value={name} onChangeText={setName} placeholder="Your name" />
          <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" />
          <Input label="Phone number" value={phone} onChangeText={setPhone} placeholder="(000) 000-0000" number />
        </View>

        <View style={{ marginTop: Spacing.three, backgroundColor: theme.accentSurface, borderRadius: 18, padding: Spacing.three }}>
          <ThemedText type="smallBold" style={{ color: theme.accentText }}>Summary</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.one, lineHeight: 20 }}>
            Keep your details accurate so doctors and clinic staff can verify your identity and reach you about your appointments.
          </ThemedText>
        </View>

        <Button
          title="Save changes"
          onPress={() => router.back()}
          style={{ marginTop: Spacing.three }}
        />
      </View>
    </Container>
  );
}
