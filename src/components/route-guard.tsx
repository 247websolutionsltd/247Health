import { useAuth } from "@/context/PageContext";
import { router, useSegments } from "expo-router";
import { useEffect } from "react";

// Public routes work while signed out. Private routes still require a signed-in patient.
const PUBLIC_ROUTES = new Set(["index", "onboard", "auth"]);

/**
 * Keeps every screen on the right side of authentication and patient onboarding, including after a restart
 * or a deep link:
 *  - signed out → anything private redirects to sign in
 *  - signed in but onboarding unfinished → redirects to /patient-onboarding
 *  - signed in and set up → sign-in remains available after the intro; other auth and setup screens redirect home
 * The splash screen ("index") makes its own routing decision, so the guard leaves it alone.
 */
export default function RouteGuard() {
  const { authReady, uid } = useAuth();
  const segments = useSegments();
  const first = (segments[0] as string | undefined) ?? "index";
  const second = segments[1] as string | undefined;

  useEffect(() => {
    if (!authReady || first === "index") return;

    if (!uid) {
      if (!PUBLIC_ROUTES.has(first)) router.replace("/auth/logIn");
    } else if (
      first === "patient-onboarding" ||
      (first === "auth" && second !== "logIn")
    ) {
      router.replace("/(tabs)/home");
    }
  }, [authReady, first, second, uid]);

  return null;
}
