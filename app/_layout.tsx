import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { useEffect } from "react";
import { router } from "expo-router";

function RootNavigator() {
  const { isAuthenticated, isAuthReady } = useAuth();

  useEffect(() => {
    if (!isAuthReady) return;
    if (isAuthenticated) router.replace("/tabs/events");
    else router.replace("/auth/login");
  }, [isAuthenticated, isAuthReady]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* <Stack.Screen name="login" />
      <Stack.Screen name="events" /> */}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
