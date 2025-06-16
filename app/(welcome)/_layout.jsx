import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack } from 'expo-router';

import { colorTheme } from '@/hooks/useColorScheme';

import { useTransactions } from '../TransactionContext';
import NewAccountProvider from './NewAccountProvider';

export default function RootLayout() {
  const { isNewUser } = useTransactions();

  if (!isNewUser) {
    return <Redirect href={"(home)/"} />
  }

  return (
    <NewAccountProvider>
      <ThemeProvider value={colorTheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{
          headerShown: false,
        }}
        >
          <Stack.Screen name="index" options={{ animation: "fade" }} />
          <Stack.Screen name="Account" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="Currency" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="Balance" options={{ animation: "slide_from_right" }} />
        </Stack>
      </ThemeProvider>
    </NewAccountProvider>
  );
}