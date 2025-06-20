import { Stack } from 'expo-router';

export default function RootLayout() {

  return (
      <Stack screenOptions={{
        headerShown: false,
      }}
      >
        <Stack.Screen name="_index" options={{ animation: "none" }} />
        <Stack.Screen name="MMBAK_Restore" options={{ animation: "simple_push" }} />
      </Stack>
  );
}