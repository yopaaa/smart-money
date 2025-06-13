import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{
        headerShown: false,
        animation: "none"
      }}
      >
        <Stack.Screen name="index"/>
        <Stack.Screen name="Home"/>
        <Stack.Screen name="Account"/>
        <Stack.Screen name="Settings"/>
        <Stack.Screen name="StatsScreen"/>
      </Stack>
    </ThemeProvider>
  );
}