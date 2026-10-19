import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth } from "../config/firebase";

export const registerUser = async (email: string, password: string) =>
  (await createUserWithEmailAndPassword(auth, email.trim(), password)).user;

export const loginUser = async (email: string, password: string) =>
  (await signInWithEmailAndPassword(auth, email.trim(), password)).user;

export const logoutUser = () => signOut(auth);

export const resetPassword = (email: string) => sendPasswordResetEmail(auth, email.trim());

/** Turns Firebase Auth errors into something a customer can act on. */
export function authErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-login-credentials":
      return "That email and password don't match. Please try again.";
    case "auth/invalid-email":
      return "That doesn't look like a valid email address.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in instead.";
    case "auth/weak-password":
      return "Choose a stronger password (at least 8 characters).";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact support.";
    case "auth/network-request-failed":
      return "Can't reach the server. Check your connection and try again.";
    case "auth/operation-not-allowed":
      return "Email/password sign-in isn't enabled for this app yet.";
    default:
      return error instanceof Error && !code ? error.message : "Something went wrong. Please try again.";
  }
}
