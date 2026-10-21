import { useAuth } from "@/context/PageContext";
import { router, useSegments } from "expo-router";
import { useEffect } from "react";

// Reachable while signed out. Everything else (tabs, doctors, account, ...) requires a signed-in patient.
const PUBLIC_ROUTES = new Set(["index", "onboard", "auth"]);

/**
 * Keeps every screen on the right side of authentication and patient onboarding, including after a restart
 * or a deep link:
 *  - signed out → anything private redirects to sign in
 *  - signed in but onboarding unfinished → redirects to /patient-onboarding
 *  - signed in and set up → the intro, sign-in and onboarding screens redirect home
 * The splash screen ("index") makes its own routing decision, so the guard leaves it alone.
 */
export default function RouteGuard() {
  const { status } = useAuth();
  const segments = useSegments();
  const first = (segments[0] as string | undefined) ?? "index";

  useEffect(() => {
    if (status === "loading" || first === "index") return;

    if (status === "signed-out") {
      if (!PUBLIC_ROUTES.has(first)) router.replace("/auth/logIn");
    } else if (status === "needs-onboarding") {
      if (first !== "patient-onboarding") router.replace("/patient-onboarding");
    } else if (first === "patient-onboarding" || first === "auth" || first === "onboard") {
      router.replace("/(tabs)/home");
    }
  }, [status, first]);

  return null;
}
