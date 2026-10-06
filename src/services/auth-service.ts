import { getSupabaseClient } from "@/lib/supabase";
import type { AuthError, Session } from "@supabase/supabase-js";
import * as AuthSession from "expo-auth-session";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

export type GoogleOAuthResult =
  | { type: "success"; session: Session }
  | { type: "cancelled" };

let googleOAuthInProgress = false;
const codeExchanges = new Map<string, Promise<Session>>();

export function getGoogleRedirectUri() {
  return AuthSession.makeRedirectUri({ path: "auth/callback" });
}

export async function completeGoogleOAuth(url: string): Promise<Session> {
  const { queryParams } = Linking.parse(url);
  const params = queryParams ?? {};
  const oauthError = params.error_description ?? params.error;
  if (oauthError) throw new Error(String(oauthError));

  const code = params.code;
  if (typeof code !== "string") throw new Error("Google sign-in returned no authorization code.");

  const existingExchange = codeExchanges.get(code);
  if (existingExchange) return existingExchange;

  const exchange = (async () => {
    const { data, error } = await getSupabaseClient().auth.exchangeCodeForSession(code);
    if (error) throw error;
    if (!data.session) throw new Error("Google sign-in completed without a Supabase session.");
    return data.session;
  })();
  codeExchanges.set(code, exchange);
  try {
    return await exchange;
  } catch (error) {
    codeExchanges.delete(code);
    throw error;
  }
}

export type AuthResult = { session: Session | null; error: AuthError | null };

export const authService = {
  async signInWithGoogle(): Promise<GoogleOAuthResult> {
    if (Platform.OS === "web") {
      throw new Error("Google sign-in must be completed in the 247Health Expo app.");
    }
    if (googleOAuthInProgress) throw new Error("Google sign-in is already in progress.");
    googleOAuthInProgress = true;

    try {
      const redirectUri = getGoogleRedirectUri();
      console.info(`[Google OAuth] Supabase OAuth redirect URI: ${redirectUri}`);
      const { data, error } = await getSupabaseClient().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: false,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) throw error;
      if (!data.url) throw new Error("Supabase did not return a Google sign-in URL.");

      const authorizationUrl = new URL(data.url);
      const configuredRedirect = authorizationUrl.searchParams.get("redirect_to");
      if (configuredRedirect !== redirectUri) {
        throw new Error(
          `Supabase is not allowing the app callback ${redirectUri}. Add this exact URI to Auth > URL Configuration > Redirect URLs; Google sign-in was stopped because the callback does not match.`,
        );
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
      if (result.type === "cancel" || result.type === "dismiss") return { type: "cancelled" };
      if (result.type !== "success") throw new Error("Google sign-in did not complete.");

      const session = await completeGoogleOAuth(result.url);
      return { type: "success", session };
    } finally {
      googleOAuthInProgress = false;
    }
  },

  async signIn(email: string, password: string) {
    const { data, error } = await getSupabaseClient().auth.signInWithPassword({ email: email.trim(), password });
    return { session: data.session, error } satisfies AuthResult;
  },

  async signUp(input: { email: string; password: string; name: string; phone: string }) {
    const { data, error } = await getSupabaseClient().auth.signUp({
      email: input.email.trim(),
      password: input.password,
      options: { data: { full_name: input.name.trim(), phone: input.phone.trim() } },
    });
    return { session: data.session, error } satisfies AuthResult;
  },

  async signOut() {
    const { error } = await getSupabaseClient().auth.signOut();
    return { error };
  },

  async sendPasswordReset(email: string) {
    const { error } = await getSupabaseClient().auth.resetPasswordForEmail(email.trim());
    return { error };
  },

  async verifyPasswordReset(email: string, token: string) {
    const { data, error } = await getSupabaseClient().auth.verifyOtp({
      email: email.trim(),
      token: token.trim(),
      type: "recovery",
    });
    return { session: data.session, error } satisfies AuthResult;
  },

  async updatePassword(password: string) {
    const { error } = await getSupabaseClient().auth.updateUser({ password });
    return { error };
  },
};