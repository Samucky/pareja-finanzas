import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';

export default function Index() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Redirect href="/(auth)/login" />;
  if (!user.coupleId) return <Redirect href="/(auth)/couple-setup" />;
  return <Redirect href="/(tabs)" />;
}
