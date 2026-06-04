import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { api } from '../../src/services/api';
import { saveTokens } from '../../src/services/authStorage';
import { useAuthStore } from '../../src/store/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError('');
    try {
      const res = await api.login({ email: email.trim(), password });
      await saveTokens(res.accessToken, res.refreshToken);
      setUser(res.user);
      if (res.user.coupleId) router.replace('/(tabs)');
      else router.replace('/(auth)/couple-setup');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>Pareja Finanzas</Text>
        <Text style={styles.sub}>Control compartido en tiempo real</Text>

        <View style={styles.form}>
          <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <Input label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button label={loading ? 'Entrando…' : 'Iniciar sesión'} onPress={handleLogin} disabled={loading} />
        </View>

        <Link href="/(auth)/register" style={styles.link}>
          <Text style={styles.linkText}>Crear cuenta nueva</Text>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: spacing.xl, justifyContent: 'center', gap: spacing.xl },
  brand: { ...typography.hero, color: colors.primary, fontSize: 32 },
  sub: { ...typography.body, color: colors.textSecondary, marginTop: -spacing.md },
  form: { gap: spacing.lg, marginTop: spacing.xxl },
  error: { ...typography.caption, color: colors.expense },
  link: { alignSelf: 'center' },
  linkText: { ...typography.body, color: colors.accent },
});
