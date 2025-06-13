import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack } from 'expo-router';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useTransactions } from '../TransactionContext';

export default function RootLayout() {
  const { isNewUser } = useTransactions();

  const colorScheme = useColorScheme();

  if (isNewUser) {
    return <Redirect href={"(welcome)/"} />
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{
        headerShown: false,
        animation: "none"
      }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="Home" />
        <Stack.Screen name="Account" />
        <Stack.Screen name="Settings" />
        <Stack.Screen name="StatsScreen" />
      </Stack>
    </ThemeProvider>
  );
}