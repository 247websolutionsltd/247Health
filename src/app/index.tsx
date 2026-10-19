import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/PageContext';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

const MIN_SPLASH_MS = 900;
const MAX_WAIT_MS = 5000; // don't hang on the splash if the network is down
const ONBOARDED_KEY = 'onboarded';

/** Branded splash. Routes to home (signed in), sign-in (returning) or onboarding (first launch). */
export default function Splash() {
  const { authReady, uid, profileReady } = useAuth();
  const [minElapsed, setMinElapsed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const navigated = useRef(false);

  useEffect(() => {
    const a = setTimeout(() => setMinElapsed(true), MIN_SPLASH_MS);
    const b = setTimeout(() => setTimedOut(true), MAX_WAIT_MS);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(ONBOARDED_KEY)
      .then((value) => {
        if (active) setOnboardingComplete(value === 'true');
      })
      .catch((error: unknown) => {
        console.error('Unable to read onboarding status', error);
        if (active) setOnboardingComplete(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (navigated.current || !authReady || !minElapsed) return;
    if (onboardingComplete === null) return;
    if (onboardingComplete && uid && !profileReady && !timedOut) return; // let the profile load so Home isn't empty

    const target = !onboardingComplete
      ? '/onboard'
      : uid
        ? '/(tabs)/home'
        : '/auth/logIn';
    navigated.current = true;
    router.replace(target);
  }, [authReady, uid, profileReady, minElapsed, timedOut, onboardingComplete]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', padding: Spacing.four }}>
      <View style={{ position: 'absolute', top: -80, right: -80, width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(255,255,255,0.08)' }} />
      <View style={{ position: 'absolute', bottom: -100, left: -60, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(255,255,255,0.06)' }} />
      <View style={{ width: 92, height: 92, borderRadius: 30, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' }}>
        <MaterialIcons name="health-and-safety" size={52} color={Colors.primary} />
      </View>
      <ThemedText type="title" style={{ color: '#FFF', marginTop: Spacing.three }}>CareNest</ThemedText>
      <ThemedText style={{ color: '#DCEBFF', marginTop: Spacing.one }}>Your health, one tap away</ThemedText>
    </View>
  );
}
