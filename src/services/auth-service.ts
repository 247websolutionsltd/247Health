import { AppError } from "@/lib/errors";
import { getFirebaseAuth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  updateProfile as updateAuthProfile,
  updatePassword,
  type User,
} from "firebase/auth";

/** The slice of a Firebase user the app needs. Keeps Firebase types out of screens and contexts. */
export type AuthUser = {
  id: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  providerIds: string[];
};

export function toAuthUser(user: User): AuthUser {
  return {
    id: user.uid,
    email: user.email,
    emailVerified: user.emailVerified,
    displayName: user.displayName,
    providerIds: user.providerData.map((p) => p.providerId),
  };
}

function requireUser(): User {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new AppError("Your session has expired. Sign in again.");
  return user;
}

export const authService = {
  /** Calls back with the current user (or null) now and whenever the session changes. Returns an unsubscribe. */
  subscribe(onUser: (user: AuthUser | null) => void, onError: (error: Error) => void) {
    return onAuthStateChanged(getFirebaseAuth(), (user) => onUser(user ? toAuthUser(user) : null), onError);
  },

  async signIn(email: string, password: string) {
    await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
  },

  async signUp(input: { email: string; password: string; name: string }) {
    const { user } = await createUserWithEmailAndPassword(getFirebaseAuth(), input.email.trim(), input.password);
    // The account exists at this point; these two are best-effort and must not fail the sign-up.
    await updateAuthProfile(user, { displayName: input.name.trim() }).catch(() => undefined);
    await sendEmailVerification(user).catch(() => undefined);
  },

  /** `idToken` comes from the Google sign-in prompt (see components/google-sign-in-button.tsx). */
  async signInWithGoogleIdToken(idToken: string) {
    await signInWithCredential(getFirebaseAuth(), GoogleAuthProvider.credential(idToken));
  },

  async signOut() {
    await firebaseSignOut(getFirebaseAuth());
  },

  async sendPasswordReset(email: string) {
    await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
  },

  async resendVerification() {
    await sendEmailVerification(requireUser());
  },

  /** Re-reads the account from Firebase (e.g. after the patient verified their email) and returns the fresh user. */
  async refreshUser(): Promise<AuthUser> {
    const user = requireUser();
    await user.reload();
    return toAuthUser(requireUser());
  },

  /** Changing a password is a sensitive action, so Firebase needs the current password again. */
  async changePassword(currentPassword: string, newPassword: string) {
    const user = requireUser();
    if (!user.email) throw new AppError("This account has no email address, so its password can't be changed.");
    if (!user.providerData.some((p) => p.providerId === "password")) {
      throw new AppError("You sign in with Google, so there is no password to change.");
    }
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, currentPassword));
    await updatePassword(user, newPassword);
  },
};