import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';

export default function Index() {
  const { user, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return null;
  }

  if (!user) return <Redirect href="/(auth)/login" />;
  if (!user.coupleId) return <Redirect href="/(auth)/couple-setup" />;
  return <Redirect href="/(tabs)" />;
}
