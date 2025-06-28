import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{
      headerShown: false,
    }}
    >
      <Stack.Screen name="TransactionForm" options={{ animation: "slide_from_bottom" }} />
      <Stack.Screen name="TransactionDetails/index" options={{ animation: "slide_from_left" }} />
    </Stack>
  );
}