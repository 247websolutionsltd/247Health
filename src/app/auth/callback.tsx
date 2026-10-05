import Container from "@/components/custom-container";
import { ThemedText } from "@/components/themed-text";
import { Colors, Spacing } from "@/constants/theme";
import { completeGoogleOAuth } from "@/services/auth-service";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";

export default function GoogleAuthCallback() {
  const callbackUrl = Linking.useLinkingURL();
  const handledUrl = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!callbackUrl || handledUrl.current === callbackUrl) return;
    handledUrl.current = callbackUrl;

    completeGoogleOAuth(callbackUrl)
      .then(() => router.replace("/"))
      .catch((caught: unknown) => {
        setError(caught instanceof Error ? caught.message : "Google sign-in could not be completed.");
      });
  }, [callbackUrl]);

  return (
    <Container edges={["top", "bottom"]}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.three }}>
        {error ? (
          <>
            <ThemedText type="large">Google sign-in failed</ThemedText>
            <ThemedText style={{ textAlign: "center", color: Colors.danger, marginVertical: Spacing.three }}>{error}</ThemedText>
            <TouchableOpacity onPress={() => router.replace("/auth/logIn")}>
              <ThemedText type="smallBold" style={{ color: Colors.primary }}>Return to sign in</ThemedText>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <ActivityIndicator size="large" color={Colors.primary} />
            <ThemedText style={{ color: Colors.primary, marginTop: Spacing.three }}>Completing Google sign-in...</ThemedText>
          </>
        )}
      </View>
    </Container>
  );
}