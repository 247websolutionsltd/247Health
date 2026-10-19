import { auth } from "@/config/firebase";
import { goReplace } from "@/lib/nav";
import { authErrorMessage, loginUser, registerUser } from "@/services/auth";
import { subscribeUserProfile, UserProfile } from "@/services/users";
import { ensureOwnerRecord, subscribeOwner, type OwnerRecord } from "@/services/owner-service";
import { profileService } from "@/services/profile-service";
import type { Profile } from '@/types/models';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

/* -------------------------------------------------------------------------- */
/* Theme                                                                       */
/* -------------------------------------------------------------------------- */

export type ThemeMode = "light" | "dark";

type ThemeContextType = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function AppThemeProvider({
  children,
  initialTheme = "dark",
}: {
  children: ReactNode;
  initialTheme?: ThemeMode;
}) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialTheme);
  const toggleThemeMode = () => setThemeMode((c) => (c === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, toggleThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useAppTheme must be used inside an AppThemeProvider");
  return context;
}

/* -------------------------------------------------------------------------- */
/* Auth / profile (Firebase Auth + live users/{uid} document)                  */
/* -------------------------------------------------------------------------- */

type LogInForm = { email: string; password: string };
type RegisterForm = { email: string; password: string; confirm: string; name: string; phone: string };

type Owner = {
  uid: string | null;
  profileImage: string | null;
  name: string;
  title: string;
  phone: string;
  email: string;
  bloodType: string | null;
  allergies: string | null;
};

type AuthenticatedOwner = Omit<Owner, "uid"> & { uid: string };

const OWNER_STORAGE_KEY = "owner";
const UID_STORAGE_KEY = "uid";

function ownerValue(value: unknown): Partial<OwnerRecord> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const data = value as Record<string, unknown>;
  const stringOrNull = (candidate: unknown) =>
    typeof candidate === "string" && candidate.trim() ? candidate.trim() : null;
  return {
    email: stringOrNull(data.email),
    displayName: stringOrNull(data.displayName) ?? stringOrNull(data.name) ?? undefined,
    phone: stringOrNull(data.phone),
    photoURL: stringOrNull(data.photoURL) ?? stringOrNull(data.profileImage),
    bloodType: stringOrNull(data.bloodType),
    allergies: stringOrNull(data.allergies),
  };
}

async function ensureMigratedOwner(
  user: Parameters<typeof ensureOwnerRecord>[0],
  seed: Parameters<typeof ensureOwnerRecord>[1] = {},
) {
  const [[, storedUid], [, storedOwner]] = await AsyncStorage.multiGet([
    UID_STORAGE_KEY,
    OWNER_STORAGE_KEY,
  ]);
  let legacyOwner: Partial<OwnerRecord> = {};

  if (storedUid === user.uid && storedOwner) {
    try {
      legacyOwner = ownerValue(JSON.parse(storedOwner) as unknown);
    } catch (error: unknown) {
      console.error("[auth] Unable to read the previous saved account", error);
    }
  }

  return ensureOwnerRecord(user, seed, legacyOwner);
}

function ownerFromRecord(record: OwnerRecord): AuthenticatedOwner {
  return {
    uid: record.uid,
    profileImage: record.photoURL,
    name: record.displayName,
    title: `Patient ID: ${record.uid.slice(0, 8).toUpperCase()}`,
    phone: record.phone ?? "",
    email: record.email ?? "",
    bloodType: record.bloodType,
    allergies: record.allergies,
  };
}

type AuthContextType = {
  /** true while a sign-in / sign-up request is in flight */
  loading: boolean;
  /** Firebase has restored (or not) the previous session */
  authReady: boolean;
  /** the first profile snapshot has arrived (or failed) for the signed-in user */
  profileReady: boolean;
  uid: string | null;
  owner: Owner;
  logInForm: LogInForm;
  profile: Profile | null;
  updateLogInField: (field: keyof LogInForm, value: string) => void;
  registerForm: RegisterForm;
  updateRegisterField: (field: keyof RegisterForm, value: string) => void;
  updateOwner: (patch: { name?: string; phone?: string }) => Promise<void>;
  handleSignup: () => Promise<void>;
  handleLogin: () => Promise<void>;
  user: UserProfile | null;
  error: string | null;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const emptyLogin: LogInForm = { email: "", password: "" };
const emptyRegister: RegisterForm = { email: "", password: "", confirm: "", name: "", phone: "" };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ownerRecord, setOwnerRecord] = useState<OwnerRecord | null>(null);
  const [logInForm, setLogInForm] = useState(emptyLogin);
  const [registerForm, setRegisterForm] = useState(emptyRegister);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const storageWriteQueue = useRef(Promise.resolve());

  const enqueueStorageWrite = useCallback((write: () => Promise<void>) => {
    const operation = storageWriteQueue.current.then(write);
    storageWriteQueue.current = operation.catch(() => undefined);
    return operation;
  }, []);

  const persistOwner = useCallback((owner: AuthenticatedOwner) =>
    enqueueStorageWrite(async () => {
      await AsyncStorage.multiSet([
        [UID_STORAGE_KEY, owner.uid],
        [OWNER_STORAGE_KEY, JSON.stringify(owner)],
      ]);
    }), [enqueueStorageWrite]);

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;
    let unsubOwner: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, (fbUser) => {
      unsubProfile?.();
      unsubOwner?.();
      unsubProfile = undefined;
      unsubOwner = undefined;
      setUser(null);
      setOwnerRecord(null);

      if (!fbUser) {
        setUid(null);
        setProfileReady(false);
        setAuthReady(true);
        void enqueueStorageWrite(() =>
          AsyncStorage.multiRemove([UID_STORAGE_KEY, OWNER_STORAGE_KEY]),
        ).catch((storageError: unknown) => {
          console.error("[auth] Unable to clear stored account", storageError);
          setError("We couldn't clear the saved account from this device.");
        });
        return;
      }

      setUid(fbUser.uid);
      setProfileReady(false);
      setAuthReady(true);
      unsubOwner = subscribeOwner(
        fbUser.uid,
        (record) => {
          if (auth.currentUser?.uid !== fbUser.uid) return;
          if (!record) return;
          setOwnerRecord(record);
          void persistOwner(ownerFromRecord(record)).catch((storageError: unknown) => {
            console.error("[auth] Unable to save the signed-in account", storageError);
            setError("We couldn't save your account on this device.");
          });
        },
        (ownerError) => {
          if (auth.currentUser?.uid !== fbUser.uid) return;
          console.error("[auth] Owner subscription failed", ownerError);
          setError("We couldn't load your account details.");
        },
      );
      void ensureMigratedOwner(fbUser).catch((ownerError: unknown) => {
        console.error("[auth] Owner record migration failed", ownerError);
        setError("We couldn't set up your account details. Please try again.");
      });

      // Live profile: balance, name, phone, card state... update everywhere instantly.
      unsubProfile = subscribeUserProfile(
        fbUser.uid,
        (profile) => {
          setUser(profile);
          // A missing profile means the sign-in migration is still creating it.
          if (profile) {
            setProfileReady(true);
          }
        },
        (error) => {
          if (auth.currentUser?.uid !== fbUser.uid) return;
          if (!auth.currentUser) return; // signed out; listener is being torn down
          console.error("[auth] profile subscription failed", error);
          setProfileReady(true); // don't block the app on a failed read
        },
      );
    });

    return () => {
      unsubProfile?.();
      unsubOwner?.();
      unsubAuth();
    };
  }, [enqueueStorageWrite, persistOwner]);

  const owner: Owner = {
    uid,
    profileImage: ownerRecord?.photoURL ?? profileImage,
    name: ownerRecord?.displayName ?? user?.displayName ?? user?.email?.split('@')[0] ?? 'Patient',
    title: ownerRecord ? `Patient ID: ${ownerRecord.uid.slice(0, 8).toUpperCase()}` : 'Patient account',
    phone: ownerRecord?.phone ?? '',
    email: ownerRecord?.email ?? user?.email ?? '',
    bloodType: ownerRecord?.bloodType ?? profile?.blood_type ?? null,
    allergies: ownerRecord?.allergies ?? profile?.allergies ?? null,
  };

  const handleSignup = async () => {
    if (loading) return;
    setLoading(true);
    let firebaseAccountCreated = false;
    try {
      const fbUser = await registerUser(registerForm.email, registerForm.password);
      firebaseAccountCreated = true;
      const displayName = registerForm.name.trim();
      await updateProfile(fbUser, { displayName });
      const record = await ensureMigratedOwner(fbUser, {
        full_name: displayName,
        phone: registerForm.phone.trim(),
      });
      setOwnerRecord(record);
      try {
        await persistOwner(ownerFromRecord(record));
      } catch (storageError: unknown) {
        console.error("[auth] Registration succeeded but account storage failed", storageError);
        setError("Your account was created, but couldn't be saved on this device.");
        Alert.alert("Account created", "Your account is active, but we couldn't save its details on this device.");
      }
      setRegisterForm(emptyRegister); // don't keep passwords in memory
      goReplace("/(tabs)/home");
    } catch (error: unknown) {
      if (firebaseAccountCreated) {
        console.error("[auth] Registration succeeded but owner setup failed", error);
        setError("Your account was created, but its owner record could not be set up. Please sign in again to retry.");
        Alert.alert("Account setup failed", "Your account was created, but we couldn't finish setting up its owner record.");
      } else {
        Alert.alert("Signup failed", authErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    let firebaseSignInSucceeded = false;
    try {
      const loggedUser = await loginUser(logInForm.email, logInForm.password);
      firebaseSignInSucceeded = true;
      const record = await ensureMigratedOwner(loggedUser);
      setOwnerRecord(record);
      try {
        await persistOwner(ownerFromRecord(record));
      } catch (storageError: unknown) {
        console.error("[auth] Sign-in succeeded but account storage failed", storageError);
        setError("You signed in, but couldn't save your account on this device.");
        Alert.alert("Signed in", "Your session is active, but we couldn't save your account details on this device.");
      }
      setLogInForm(emptyLogin);
      goReplace("/(tabs)/home");
    } catch (error: unknown) {
      if (firebaseSignInSucceeded) {
        console.error("[auth] Sign-in succeeded but owner setup failed", error);
        setError("You signed in, but your owner record could not be set up. Please try signing in again.");
        Alert.alert("Account setup failed", "You signed in, but we couldn't finish setting up your owner record.");
      } else {
        Alert.alert("Login failed", authErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  };

  const updateOwner: AuthContextType["updateOwner"] = async (patch) => {
    const fbUser = auth.currentUser;
    if (!fbUser) throw new Error("You must be signed in to update your profile.");
    const displayName = patch.name?.trim() ?? owner.name;
    const phone = patch.phone?.trim() ?? owner.phone;
    await updateProfile(fbUser, { displayName });
    await profileService.updateMine(fbUser.uid, { full_name: displayName, phone });
    const updatedOwner = await ensureMigratedOwner(fbUser);
    setOwnerRecord(updatedOwner);
    await persistOwner(ownerFromRecord(updatedOwner));
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        authReady,
        profileReady,
        uid,
        user,
        owner,
        logInForm,
        updateLogInField: (f, v) => setLogInForm((p) => ({ ...p, [f]: v })),
        registerForm,
        updateRegisterField: (f, v) => setRegisterForm((p) => ({ ...p, [f]: v })),
        updateOwner,
        handleSignup,
        handleLogin,
        profile,
        error,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider");
  return context;
}
