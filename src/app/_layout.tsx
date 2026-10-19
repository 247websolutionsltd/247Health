import RouteGuard from '@/components/route-guard';
import { AppThemeProvider, AuthProvider } from '@/context/PageContext';
import { DataProvider } from '@/context/DataContext';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppThemeProvider initialTheme={colorScheme === 'dark' ? 'dark' : 'light'}>
        <AuthProvider>
          <DataProvider>
            <RouteGuard />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="onboard" />
              <Stack.Screen name="patient-onboarding" options={{ gestureEnabled: false }} />
              <Stack.Screen name="doctors/index" />
              <Stack.Screen name="doctors/[id]" />
              <Stack.Screen name="booking-confirmation" options={{ gestureEnabled: false }} />
            </Stack>
          </DataProvider>
        </AuthProvider>
      </AppThemeProvider>
    </ThemeProvider>
  );
}
