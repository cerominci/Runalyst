// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      <Stack.Screen name="start" options={{ gestureEnabled: false }} />
      <Stack.Screen name="signin" options={{ gestureEnabled: false }} />
      <Stack.Screen name="signup" options={{ gestureEnabled: false }} />
      <Stack.Screen name="profile" options={{ gestureEnabled: false }} />
      <Stack.Screen name="verify-email" options={{ gestureEnabled: false }} />
    </Stack>
  );
}