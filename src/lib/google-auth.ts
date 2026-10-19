import { Platform } from "react-native";

// Google sign-in is optional: the button only appears when the client ID for the current platform is set.
// Create OAuth client IDs in Google Cloud Console (same project as Firebase) and add them to .env.
export const googleClientIds = {
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
};

export function isGoogleSignInConfigured() {
  if (Platform.OS === "ios") return Boolean(googleClientIds.iosClientId);
  if (Platform.OS === "android") return Boolean(googleClientIds.androidClientId);
  return Boolean(googleClientIds.webClientId);
}
