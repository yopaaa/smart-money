import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
 

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: '#00BFFF' },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
      }}
      >
        <Stack.Screen name="index" options={{ animation: "fade" }} />
        <Stack.Screen name="Account" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="Currency" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="Balance" options={{ animation: "slide_from_right" }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}