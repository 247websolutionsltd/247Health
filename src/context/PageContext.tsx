import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { authService, type GoogleOAuthResult } from '@/services/auth-service';
import { profileService, type ProfileUpdate } from '@/services/profile-service';
import type { Profile } from '@/types/database.types';
import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';

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
  balance: string;
  bloodType: string | null;
  allergies: string | null;
}

type AuthContextType = {
  loading: boolean;
  isReady: boolean;
  profileReady: boolean;
  profileLoading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  error: string | null;
  clearError: () => void;
  signIn: (email: string, password: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<GoogleOAuthResult | { type: "error"; message: string }>;
  signUp: (input: { email: string; password: string; name: string; phone: string }) => Promise<{ error: string | null; session: Session | null }>;
  signOut: () => Promise<string | null>;
  sendPasswordReset: (email: string) => Promise<string | null>;
  verifyPasswordReset: (email: string, token: string) => Promise<string | null>;
  updatePassword: (password: string) => Promise<string | null>;
  updateProfile: (input: ProfileUpdate) => Promise<string | null>;
  updateAvatar: (uri: string, contentType?: string) => Promise<string | null>;
  reloadProfile: () => Promise<string | null>;
  logInForm: LogInForm;
  updateLogInField: (field: "email" | "password", value: string)=>void;
  registerForm: RegisterForm;
  updateRegisterField: (field: "email" | "password" | "confirm" | "name" | "phone" | "interest", value: string)=>void;
  owner: Owner;
};

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(() => !isSupabaseConfigured());
  const [profileReady, setProfileReady] = useState(() => !isSupabaseConfigured());
  const [profileLoading, setProfileLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(() => isSupabaseConfigured() ? null : 'Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and an anon or publishable key to your local environment.');
  const activeUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const client = getSupabaseClient();

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, nextSession) => {
      const nextUserId = nextSession?.user.id ?? null;
      if (activeUserId.current !== nextUserId) {
        setProfile(null);
        setProfileImage(null);
      }
      activeUserId.current = nextUserId;
      setSession(nextSession);
      setIsReady(true);
      setProfileReady(!nextSession);
      setProfileLoading(Boolean(nextSession));
    });

    const appStateSubscription = Platform.OS === 'web'
      ? null
      : AppState.addEventListener('change', (state) => {
        if (state === 'active') client.auth.startAutoRefresh();
        else client.auth.stopAutoRefresh();
      });

    if (Platform.OS !== 'web' && AppState.currentState === 'active') client.auth.startAutoRefresh();

    return () => {
      subscription.unsubscribe();
      appStateSubscription?.remove();
      if (Platform.OS !== 'web') client.auth.stopAutoRefresh();
    };
  }, []);

  const user = session?.user ?? null;

  useEffect(() => {
    let active = true;
    if (!user) return () => { active = false; };
    profileService.getMine(user)
      .then(async (nextProfile) => {
        if (!active) return;
        setProfile(nextProfile);
        if (nextProfile.avatar_path) {
          try {
            const url = await profileService.getAvatarUrl(nextProfile.avatar_path);
            if (active) setProfileImage(url);
          } catch (caught) {
            if (active) setError(caught instanceof Error ? caught.message : 'Could not load your profile photo.');
          }
        }
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof Error ? caught.message : 'Could not load your profile.');
      })
      .finally(() => {
        if (active) {
          setProfileLoading(false);
          setProfileReady(true);
        }
      });
    return () => { active = false; };
  }, [user]);

  const runAction = async <T,>(action: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    try {
      return { data: await action(), error: null as string | null };
    } catch (caught) {
      return { data: null, error: caught instanceof Error ? caught.message : 'Something went wrong. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const result = await runAction(async () => {
      const response = await authService.signIn(email, password);
      if (response.error) throw response.error;
      return response.session;
    });
    return result.error;
  };

  const signInWithGoogle = async (): Promise<GoogleOAuthResult | { type: "error"; message: string }> => {
    setLoading(true);
    setError(null);
    try {
      return await authService.signInWithGoogle();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not sign in with Google.";
      setError(message);
      return { type: "error", message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (input: { email: string; password: string; name: string; phone: string }) => {
    const result = await runAction(async () => {
      const response = await authService.signUp(input);
      if (response.error) throw response.error;
      return response.session;
    });
    return { error: result.error, session: result.data };
  };

  const signOut = async () => {
    const result = await runAction(async () => {
      const response = await authService.signOut();
      if (response.error) throw response.error;
    });
    return result.error;
  };

  const sendPasswordReset = async (email: string) => {
    const result = await runAction(async () => {
      const response = await authService.sendPasswordReset(email);
      if (response.error) throw response.error;
    });
    return result.error;
  };

  const verifyPasswordReset = async (email: string, token: string) => {
    const result = await runAction(async () => {
      const response = await authService.verifyPasswordReset(email, token);
      if (response.error) throw response.error;
      return response.session;
    });
    return result.error;
  };

  const updatePassword = async (password: string) => {
    const result = await runAction(async () => {
      const response = await authService.updatePassword(password);
      if (response.error) throw response.error;
    });
    return result.error;
  };

  const updateProfile = async (input: ProfileUpdate) => {
    if (!user) return 'Sign in to update your patient profile.';
    const result = await runAction(() => profileService.updateMine(user.id, input));
    if (result.data) setProfile(result.data);
    return result.error;
  };

  const updateAvatar = async (uri: string, contentType?: string) => {
    if (!user) return 'Sign in to update your profile photo.';
    const result = await runAction(() => profileService.uploadAvatar(user.id, uri, contentType));
    if (result.data) {
      setProfile(result.data.profile);
      setProfileImage(result.data.avatarUrl);
    }
    return result.error;
  };

  const reloadProfile = async () => {
    if (!user) return 'Sign in to load your patient profile.';
    setProfileLoading(true);
    setProfileReady(false);
    setError(null);
    try {
      const nextProfile = await profileService.getMine(user);
      setProfile(nextProfile);
      if (nextProfile.avatar_path) {
        setProfileImage(await profileService.getAvatarUrl(nextProfile.avatar_path));
      } else {
        setProfileImage(null);
      }
      return null;
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Could not load your profile.';
      setError(message);
      return message;
    } finally {
      setProfileLoading(false);
      setProfileReady(true);
    }
  };

  const [logInForm, setLogInForm] = useState({
    email: "",
    password: "",
  });
  const updateLogInField = (
    field: keyof typeof logInForm,
    value: string
  ) => {
    setLogInForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    confirm: "",
    name: "",
    phone: "",
    interest: "",
  });
  
  const updateRegisterField = (
    field: keyof typeof registerForm,
    value: string
  ) => {
    setRegisterForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const owner: Owner = {
      profileImage:"https://images.unsplash.com/photo-1788801246805-284ab3eb2860?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw5fHx8ZW58MHx8fHx8",
      name: profile?.full_name ?? user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Patient',
      title: user ? `Patient ID: ${user.id.slice(0, 8).toUpperCase()}` : 'Patient account',
      phone: profile?.phone ?? '',
      email: user?.email ?? '',
      balance: '0',
      bloodType: profile?.blood_type ?? null,
      allergies: profile?.allergies ?? null,
  };


  return (
    <AuthContext.Provider
      value={{
        loading,
        isReady,
        profileReady,
        profileLoading,
        session,
        user,
        profile,
        error,
        clearError: () => setError(null),
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
        sendPasswordReset,
        verifyPasswordReset,
        updatePassword,
        updateProfile,
        updateAvatar,
        reloadProfile,
        logInForm,
        updateLogInField,
        registerForm,
        updateRegisterField,
        owner: {
          ...owner,
          profileImage,
          bloodType: profile?.blood_type ?? null,
          allergies: profile?.allergies ?? null,
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside an AuthProvider'
    );
  }

  return context;
}