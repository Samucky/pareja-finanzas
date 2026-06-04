import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { LoadingScreen } from '../src/components/LoadingScreen';

export default function Index() {
  const { user, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return (
      <LoadingScreen message="Iniciando sesión" submessage="Un momento..." variant="page" />
    );
  }

  if (!user) return <Redirect href="/(auth)/login" />;
  if (!user.coupleId) return <Redirect href="/(auth)/couple-setup" />;
  return <Redirect href="/(tabs)" />;
}
