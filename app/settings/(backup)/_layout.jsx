import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';

import { colorTheme } from '@/hooks/useColorScheme';

export default function RootLayout() {

  return (
    <ThemeProvider value={colorTheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{
        headerShown: false,
      }}
      >
        <Stack.Screen name="MMBAK_Restore" options={{ animation: "simple_push" }} />
      </Stack>
    </ThemeProvider>
  );
}