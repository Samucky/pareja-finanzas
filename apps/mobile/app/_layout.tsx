import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts, DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '../src/theme/colors';
import { useAuthStore } from '../src/store/authStore';
import { api } from '../src/services/api';
import { getAccessToken } from '../src/services/authStorage';
import { TransactionModal } from '../src/components/TransactionModal';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const { user, isHydrated, setUser, setHydrated } = useAuthStore();

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          const me = await api.me();
          setUser(me);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setHydrated(true);
      }
    })();
  }, [setUser, setHydrated]);

  useEffect(() => {
    if (!isHydrated || !navigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
      return;
    }
    if (user && !user.coupleId) {
      if (!segments.includes('couple-setup')) router.replace('/(auth)/couple-setup');
      return;
    }
    if (user?.coupleId && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, isHydrated, segments, router, navigationState?.key]);

  if (!isHydrated || !navigationState?.key) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    DMSans_600SemiBold,
    DMSans_700Bold,
    Inter_400Regular,
    Inter_500Medium,
  });
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
      setAppReady(true);
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    const t = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
      setAppReady(true);
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  if (!appReady) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <AuthGate>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
          <TransactionModal />
        </AuthGate>
      </QueryClientProvider>
    </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  boot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
