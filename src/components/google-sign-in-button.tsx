import { ThemedText } from "@/components/themed-text";
import { Colors, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/PageContext";
import { googleClientIds } from "@/lib/google-auth";
import { useStyles } from "@/styles/styles";
import { MaterialIcons } from "@expo/vector-icons";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { TouchableOpacity } from "react-native";

WebBrowser.maybeCompleteAuthSession();

/**
 * Only render this when isGoogleSignInConfigured() is true: the auth-session hook throws if the client ID
 * for the current platform is missing.
 */
export default function GoogleSignInButton({ onError, onSuccess }: { onError: (message: string) => void; onSuccess: () => void }) {
  const styles = useStyles();
  const { signInWithGoogleIdToken, loading, clearError } = useAuth();
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: googleClientIds.webClientId,
    webClientId: googleClientIds.webClientId,
    iosClientId: googleClientIds.iosClientId,
    androidClientId: googleClientIds.androidClientId,
    selectAccount: true,
  });

  useEffect(() => {
    if (!response) return;
    if (response.type === "success") {
      const idToken = response.params?.id_token ?? response.authentication?.idToken;
      if (!idToken) {
        onError("Google sign-in didn't return an ID token. Please try again.");
        return;
      }
      void signInWithGoogleIdToken(idToken).then((error) => (error ? onError(error) : onSuccess()));
    } else if (response.type === "error") {
      onError(response.error?.message ?? "Google sign-in failed. Please try again.");
    }
    // Only react to a new response.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  return (
    <TouchableOpacity
      style={[styles.socialBtn, { opacity: loading || !request ? 0.5 : 1 }]}
      onPress={() => {
        clearError();
        void promptAsync();
      }}
      disabled={loading || !request}
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
    >
      <MaterialIcons name="g-translate" size={20} color={Colors.primary} />
      <ThemedText type="smallBold" style={{ marginLeft: Spacing.two }}>Google</ThemedText>
    </TouchableOpacity>
  );
}
