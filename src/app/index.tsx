import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/PageContext';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

// Show the full splash once per app launch; later visits (e.g. right after signing in) route straight through.
let splashShown = false;

export default function Splash() {
  const { status } = useAuth();

  useEffect(() => {
    if (status === 'loading') return;
    let mounted = true;
    const t = setTimeout(async () => {
      let introSeen = 'false';
      try { introSeen = (await AsyncStorage.getItem('onboarded')) ?? 'false'; } catch (e) { console.warn('Could not read intro state', e); }
      if (!mounted) return;
      splashShown = true;
      if (status === 'needs-onboarding') router.replace('/patient-onboarding');
      else if (status === 'ready') router.replace('/(tabs)/home');
      else router.replace(introSeen === 'true' ? '/auth/logIn' : '/onboard');
    }, splashShown ? 0 : 1000);
    return () => { mounted = false; clearTimeout(t); };
  }, [status]);

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
