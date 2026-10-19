import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import * as FirebaseAuth from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { Platform } from "react-native";

// Values come from your .env (see .env.example). Expo inlines EXPO_PUBLIC_* at build time,
// so restart with `npx expo start --clear` after changing them.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const missing = (["apiKey", "authDomain", "projectId", "appId"] as const).filter((k) => !firebaseConfig[k]);
if (missing.length) {
  console.error(
    `[firebase] Missing EXPO_PUBLIC_FIREBASE_* values for: ${missing.join(", ")}. ` +
      "Check your .env and restart Expo with --clear.",
  );
}

// Fast Refresh re-runs this module; reuse the existing app instead of crashing.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const rnAuth = FirebaseAuth as typeof FirebaseAuth & {
  getReactNativePersistence: (storage: typeof AsyncStorage) => FirebaseAuth.Persistence;
};

function createAuth() {
  if (Platform.OS === "web") return FirebaseAuth.getAuth(app);
  try {
    return rnAuth.initializeAuth(app, { persistence: rnAuth.getReactNativePersistence(AsyncStorage) });
  } catch {
    // already initialised (Fast Refresh)
    return FirebaseAuth.getAuth(app);
  }
}

function createDb() {
  try {
    // Auto-detect long polling avoids hanging connections on some mobile networks / proxies.
    return initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
  } catch {
    return getFirestore(app);
  }
}

export const auth = createAuth();
export const db = createDb();
