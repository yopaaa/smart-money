import { Redirect, Stack } from 'expo-router';


import { useTransactions } from '../TransactionContext';

export default function RootLayout() {
  const { isNewUser } = useTransactions();

  if (isNewUser) {
    return <Redirect href={"(welcome)/"} />
  }

  return (
      <Stack screenOptions={{
        headerShown: false,
      }}
      >
        <Stack.Screen name="index"  options={{ animation: "none" }}  />
        <Stack.Screen name="Home" options={{ animation: "none" }} />
        <Stack.Screen name="Account"  options={{ animation: "none" }} />
        <Stack.Screen name="Settings"  options={{ animation: "none" }} />
        <Stack.Screen name="(settings)"  options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="StatsScreen"  options={{ animation: "none" }} />
      </Stack>
  );
}