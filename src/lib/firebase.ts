import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, initializeAuth, type Auth } from "firebase/auth";
// Metro resolves "firebase/auth" to the React Native build at runtime, which exports this helper, but the
// published type declarations omit it. See https://github.com/firebase/firebase-js-sdk/issues/7584
// @ts-ignore -- exported at runtime on React Native; missing from the bundled .d.ts
import { getReactNativePersistence } from "firebase/auth";
import { getFirestore, initializeFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { Platform } from "react-native";

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const FIREBASE_SETUP_MESSAGE =
  "Firebase is not configured. Copy .env.example to .env, fill in your Firebase web app keys, then restart Expo with `npx expo start -c`.";

export function isFirebaseConfigured() {
  return Object.values(config).every((value) => Boolean(value));
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

function requireConfigured() {
  if (!isFirebaseConfigured()) throw new Error(FIREBASE_SETUP_MESSAGE);
}

export function getFirebaseApp(): FirebaseApp {
  requireConfigured();
  if (!app) app = getApps().find((candidate) => candidate.name === "[DEFAULT]") ?? initializeApp(config);
  return app;
}

export function getFirebaseAuth(): Auth {
  if (auth) return auth;
  const firebaseApp = getFirebaseApp();
  if (Platform.OS === "web") {
    auth = getAuth(firebaseApp);
  } else {
    try {
      // Persist the session across app restarts.
      auth = initializeAuth(firebaseApp, { persistence: getReactNativePersistence(AsyncStorage) });
    } catch (error) {
      // Fast Refresh re-evaluates this module; Auth was already initialised.
      if ((error as { code?: string } | null)?.code !== "auth/already-initialized") throw error;
      auth = getAuth(firebaseApp);
    }
  }
  return auth;
}

export function getDb(): Firestore {
  if (db) return db;
  const firebaseApp = getFirebaseApp();
  try {
    // Auto-detect avoids WebChannel connection failures that affect some React Native networks.
    db = initializeFirestore(firebaseApp, { experimentalAutoDetectLongPolling: true });
  } catch (error) {
    if ((error as { code?: string } | null)?.code !== "failed-precondition") throw error;
    db = getFirestore(firebaseApp);
  }
  return db;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) storage = getStorage(getFirebaseApp());
  return storage;
}
