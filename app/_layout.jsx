import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { CustomDarkTheme, CustomLightTheme, ThemeProvider, useTheme } from '@/hooks/ThemeContext';
import { TransactionProvider } from '@/hooks/TransactionContext.jsx';

function InnerLayout() {
  const { theme } = useTheme();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <TransactionProvider>
      <NavThemeProvider value={theme.mode === 'dark' ? CustomDarkTheme : CustomLightTheme}>
        <Stack screenOptions={{
          animation: "none",
          headerShown: false,
          headerStyle: { backgroundColor: '#00BFFF' },
          headerTintColor: '#fff',
          headerTitleAlign: 'center',
        }}
        >
          {/* <Stack.Screen name="function/ReminderSettings" options={{ animation: "none" }} /> */}
          <Stack.Screen name="(home)" options={{ animation: "none" }} />
          <Stack.Screen name="(backup)" options={{ animation: "none" }} />
          <Stack.Screen name="(welcome)" options={{ animation: "fade" }} />
          <Stack.Screen name="Report" options={{ animation: "none" }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </NavThemeProvider>
    </TransactionProvider>
  );
}


export default function RootLayout() {
  return (
    <ThemeProvider>
      <InnerLayout />
    </ThemeProvider>
  );
}