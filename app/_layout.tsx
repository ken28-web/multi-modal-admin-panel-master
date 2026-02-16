import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="selection" />
      <Stack.Screen name="public-admin" />
      <Stack.Screen name="private-admin" />
    </Stack>
  );
}
