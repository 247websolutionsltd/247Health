import { friendlyError } from '@/lib/errors';
import { FIREBASE_SETUP_MESSAGE, isFirebaseConfigured } from '@/lib/firebase';
import { authService, type AuthUser } from '@/services/auth-service';
import { profileService, type ProfileSeed, type ProfileUpdate } from '@/services/profile-service';
import type { Profile } from '@/types/models';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark';

type ThemeContextType = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function AppThemeProvider({
  children,
  initialTheme = 'light',
}: {
  children: ReactNode;
  initialTheme?: ThemeMode;
}) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialTheme);

  const toggleThemeMode = () => {
    setThemeMode((current) => (current === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, toggleThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used inside an AppThemeProvider');
  }

  return context;
}

type LogInForm = {
  email: string;
  password: string;
};

type RegisterForm = {
  email: string;
  password: string;
  confirm: string;
  name: string;
  phone: string;
  interest: string;
};

type Owner = {
  profileImage: string | null;
  name: string;
  title: string;
  phone: string;
  email: string;
  bloodType: string | null;
  allergies: string | null;
};

/**
 * loading           resolving the saved session and the patient's profile
 * signed-out        nobody is signed in
 * needs-onboarding  signed in, but the patient-details step isn't finished (or the profile couldn't be loaded)
 * ready             signed in and set up
 */
export type AuthStatus = 'loading' | 'signed-out' | 'needs-onboarding' | 'ready';

type AuthContextType = {
  status: AuthStatus;
  loading: boolean;
  isReady: boolean;
  profileReady: boolean;
  profileLoading: boolean;
  user: AuthUser | null;
  profile: Profile | null;
  error: string | null;
  clearError: () => void;
  signIn: (email: string, password: string) => Promise<string | null>;
  signInWithGoogleIdToken: (idToken: string) => Promise<string | null>;
  signUp: (input: { email: string; password: string; name: string; phone: string }) => Promise<string | null>;
  signOut: () => Promise<string | null>;
  sendPasswordReset: (email: string) => Promise<string | null>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<string | null>;
  resendVerification: () => Promise<string | null>;
  refreshUser: () => Promise<string | null>;
  updateProfile: (input: ProfileUpdate) => Promise<string | null>;
  updateAvatar: (uri: string, contentType?: string) => Promise<string | null>;
  reloadProfile: () => Promise<string | null>;
  logInForm: LogInForm;
  updateLogInField: (field: 'email' | 'password', value: string) => void;
  registerForm: RegisterForm;
  updateRegisterField: (field: 'email' | 'password' | 'confirm' | 'name' | 'phone' | 'interest', value: string) => void;
  owner: Owner;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const EMPTY_LOGIN: LogInForm = { email: '', password: '' };
const EMPTY_REGISTER: RegisterForm = { email: '', password: '', confirm: '', name: '', phone: '', interest: '' };

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isFirebaseConfigured();
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(!configured);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileReady, setProfileReady] = useState(!configured);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(configured ? null : FIREBASE_SETUP_MESSAGE);
  const activeUserId = useRef<string | null>(null);
  // Name and phone typed on the sign-up form. Firebase Auth doesn't keep a phone number, so the profile
  // created right after sign-up is seeded from here.
  const signupSeed = useRef<ProfileSeed | null>(null);

  // ----- Session -----
  useEffect(() => {
    if (!configured) return;
    return authService.subscribe(
      (next) => {
        const nextId = next?.id ?? null;
        if (activeUserId.current !== nextId) {
          activeUserId.current = nextId;
          setProfile(null);
          setProfileImage(null);
          setProfileReady(!next);
          setProfileLoading(Boolean(next));
        }
        setUser(next);
        setIsReady(true);
      },
      (caught) => {
        setError(friendlyError(caught));
        setIsReady(true);
      },
    );
  }, [configured]);

  // ----- Profile (loaded whenever the signed-in patient changes) -----
  const userId = user?.id ?? null;
  const loadProfile = useCallback(async (uid: string, isCurrent: () => boolean) => {
    setProfileLoading(true);
    try {
      const seed = signupSeed.current ?? {};
      const next = await profileService.getMine(uid, seed);
      if (!isCurrent()) return null;
      signupSeed.current = null;
      setProfile(next);
      setError(null);
      if (next.avatar_path) {
        // A missing or unreadable photo shouldn't block the app.
        profileService.getAvatarUrl(next.avatar_path, next.updated_at)
          .then((url) => { if (isCurrent()) setProfileImage(url); })
          .catch(() => undefined);
      }
      return null;
    } catch (caught) {
      const message = friendlyError(caught, 'Could not load your profile.');
      if (isCurrent()) setError(message);
      return message;
    } finally {
      if (isCurrent()) {
        setProfileLoading(false);
        setProfileReady(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    void loadProfile(userId, () => active && activeUserId.current === userId);
    return () => { active = false; };
  }, [userId, loadProfile]);

  const reloadProfile = async () => {
    if (!userId) return null;
    return loadProfile(userId, () => activeUserId.current === userId);
  };

  // ----- Actions -----
  const runAction = async <T,>(action: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    try {
      return { data: await action(), error: null as string | null };
    } catch (caught) {
      return { data: null, error: friendlyError(caught) };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!email.trim() || !password) return 'Enter your email and password.';
    return (await runAction(() => authService.signIn(email, password))).error;
  };

  const signInWithGoogleIdToken = async (idToken: string) =>
    (await runAction(() => authService.signInWithGoogleIdToken(idToken))).error;

  const signUp = async (input: { email: string; password: string; name: string; phone: string }) => {
    signupSeed.current = { full_name: input.name, phone: input.phone };
    const result = await runAction(() => authService.signUp(input));
    if (result.error) signupSeed.current = null;
    return result.error;
  };

  const signOut = async () => {
    const result = await runAction(() => authService.signOut());
    if (!result.error) {
      setLogInForm(EMPTY_LOGIN);
      setRegisterForm(EMPTY_REGISTER);
    }
    return result.error;
  };

  const sendPasswordReset = async (email: string) => {
    if (!email.trim()) return 'Enter your email address.';
    return (await runAction(() => authService.sendPasswordReset(email))).error;
  };

  const changePassword = async (currentPassword: string, newPassword: string) =>
    (await runAction(() => authService.changePassword(currentPassword, newPassword))).error;

  const resendVerification = async () => (await runAction(() => authService.resendVerification())).error;

  const refreshUser = async () => {
    const result = await runAction(() => authService.refreshUser());
    if (result.data) setUser(result.data);
    return result.error;
  };

  const updateProfile = async (input: ProfileUpdate) => {
    if (!userId) return 'Sign in to update your profile.';
    const result = await runAction(() => profileService.updateMine(userId, input));
    if (result.data) setProfile(result.data);
    return result.error;
  };

  const updateAvatar = async (uri: string, contentType?: string) => {
    if (!userId) return 'Sign in to update your profile photo.';
    const result = await runAction(() => profileService.uploadAvatar(userId, uri, contentType));
    if (result.data) {
      setProfile(result.data.profile);
      setProfileImage(result.data.avatarUrl);
    }
    return result.error;
  };

  // ----- Forms shared across the auth screens -----
  const [logInForm, setLogInForm] = useState<LogInForm>(EMPTY_LOGIN);
  const updateLogInField = (field: keyof LogInForm, value: string) => setLogInForm((prev) => ({ ...prev, [field]: value }));

  const [registerForm, setRegisterForm] = useState<RegisterForm>(EMPTY_REGISTER);
  const updateRegisterField = (field: keyof RegisterForm, value: string) => setRegisterForm((prev) => ({ ...prev, [field]: value }));

  const status: AuthStatus = !isReady
    ? 'loading'
    : !user
      ? 'signed-out'
      : !profileReady || profileLoading
        ? 'loading'
        : profile?.patient_details_completed_at
          ? 'ready'
          : 'needs-onboarding';

  const owner: Owner = {
    profileImage,
    name: profile?.full_name || user?.displayName || user?.email?.split('@')[0] || 'Patient',
    title: user ? `Patient ID: ${user.id.slice(0, 8).toUpperCase()}` : 'Patient account',
    phone: profile?.phone ?? '',
    email: user?.email ?? '',
    bloodType: profile?.blood_type ?? null,
    allergies: profile?.allergies ?? null,
  };

  return (
    <AuthContext.Provider
      value={{
        status,
        loading,
        isReady,
        profileReady,
        profileLoading,
        user,
        profile,
        error,
        clearError: () => setError(null),
        signIn,
        signInWithGoogleIdToken,
        signUp,
        signOut,
        sendPasswordReset,
        changePassword,
        resendVerification,
        refreshUser,
        updateProfile,
        updateAvatar,
        reloadProfile,
        logInForm,
        updateLogInField,
        registerForm,
        updateRegisterField,
        owner,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
}
