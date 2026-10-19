/** An error whose message is already written for the end user. */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppError";
  }
}

const MESSAGES: Record<string, string> = {
  // Auth
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/missing-email": "Enter your email address.",
  "auth/user-disabled": "This account has been disabled. Contact support for help.",
  "auth/user-not-found": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/invalid-login-credentials": "Incorrect email or password.",
  "auth/email-already-in-use": "An account with this email already exists. Try signing in instead.",
  "auth/weak-password": "Choose a stronger password (at least 8 characters).",
  "auth/too-many-requests": "Too many attempts. Wait a few minutes and try again.",
  "auth/network-request-failed": "Can't reach the server. Check your internet connection and try again.",
  "auth/requires-recent-login": "For your security, sign in again and retry.",
  "auth/popup-closed-by-user": "Sign-in was cancelled.",
  "auth/cancelled-popup-request": "Sign-in was cancelled.",
  "auth/account-exists-with-different-credential": "An account already exists with this email using a different sign-in method.",
  "auth/operation-not-allowed": "This sign-in method isn't enabled for the app yet.",
  "auth/unauthorized-domain": "This domain isn't authorised for sign-in in your Firebase project.",
  // Firestore
  "permission-denied": "You don't have permission to do that. Try signing out and in again.",
  unavailable: "Can't reach the server. Check your internet connection and try again.",
  "deadline-exceeded": "The request timed out. Please try again.",
  "resource-exhausted": "Too many requests right now. Please try again shortly.",
  "failed-precondition": "That action isn't available right now. Please refresh and try again.",
  aborted: "That change conflicted with another update. Please try again.",
  "not-found": "We couldn't find that record.",
  unauthenticated: "Your session has expired. Sign in again.",
  // Storage
  "storage/unauthorized": "You don't have permission to upload this file.",
  "storage/canceled": "Upload cancelled.",
  "storage/retry-limit-exceeded": "The upload timed out. Check your connection and try again.",
  "storage/quota-exceeded": "Storage quota exceeded. Contact support.",
  "storage/object-not-found": "That file no longer exists.",
  "storage/bucket-not-found": "Photo storage isn't set up for this project yet.",
  "storage/project-not-found": "Photo storage isn't set up for this project yet.",
};

/** Turns any thrown value (Firebase or otherwise) into a message that is safe to show to a patient. */
export function friendlyError(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error instanceof AppError) return error.message;
  const code = (error as { code?: string } | null)?.code;
  if (code) {
    if (MESSAGES[code]) return MESSAGES[code];
    const bare = code.replace(/^firestore\//, "");
    if (MESSAGES[bare]) return MESSAGES[bare];
  }
  if (error instanceof Error && error.message && !code) return error.message;
  return fallback;
}
