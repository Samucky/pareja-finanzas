import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
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
import { LoadingScreen } from '../src/components/LoadingScreen';
import { AppAlert } from '../src/components/AppAlert';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

const AUTH_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const { user, isHydrated, setUser, setHydrated } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          const me = await withTimeout(api.me(), AUTH_TIMEOUT_MS);
          if (!cancelled) setUser(me);
        } else if (!cancelled) {
          setUser(null);
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    const forceHydrate = setTimeout(() => {
      if (!cancelled) setHydrated(true);
    }, AUTH_TIMEOUT_MS + 500);

    return () => {
      cancelled = true;
      clearTimeout(forceHydrate);
    };
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

  return (
    <View style={styles.gate}>
      {children}
      {!isHydrated ? (
        <LoadingScreen variant="boot" message="Pareja Finanzas" submessage="Iniciando..." />
      ) : null}
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    DMSans_600SemiBold,
    DMSans_700Bold,
    Inter_400Regular,
    Inter_500Medium,
  });

  useEffect(() => {
    const hide = () => SplashScreen.hideAsync().catch(() => {});

    if (fontsLoaded || fontError) {
      hide();
      return;
    }

    const t = setTimeout(hide, 1500);
    return () => clearTimeout(t);
  }, [fontsLoaded, fontError]);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.root}>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          <AuthGate>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
            </Stack>
            <TransactionModal />
            <AppAlert />
          </AuthGate>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  gate: { flex: 1 },
});
