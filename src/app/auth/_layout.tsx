import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{headerShown: false}}>
        <Stack.Screen name="register" />
        <Stack.Screen name="logIn" />
        <Stack.Screen name="forgot" />
        <Stack.Screen name="otp" />
        <Stack.Screen name="reset" />
        <Stack.Screen name="callback" />
    </Stack>
  );
}