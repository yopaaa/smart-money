import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { TransactionProvider } from './TransactionContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <TransactionProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{
          animation: "fade_from_bottom",
          headerShown: false,
          headerStyle: { backgroundColor: '#00BFFF' },
          headerTintColor: '#fff',
          headerTitleAlign: 'center',
        }}
        >
          <Stack.Screen name="(home)" options={{animation: "fade"}}/>
          <Stack.Screen name="(welcome)" options={{animation: "fade"}}/>
          <Stack.Screen name="index" options={{animation: "fade"}}/>
          <Stack.Screen name="transaction/[id]"  />
          <Stack.Screen name="transaction/TransactionForm" />
          <Stack.Screen name="transaction/Search" options={{animation: "slide_from_bottom"}}/>
          <Stack.Screen name="transaction/PerCategoriesTransactions/index"  options={{animation: "flip"}}/>
          <Stack.Screen name="+not-found" /> 
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </TransactionProvider>
  );
}