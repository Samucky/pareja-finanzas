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

export default function RegisterScreen() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setLoading(true);
    setError('');
    try {
      const res = await api.register({
        email: email.trim(),
        password,
        displayName: displayName.trim(),
      });
      await saveTokens(res.accessToken, res.refreshToken);
      setUser(res.user);
      router.replace('/(auth)/couple-setup');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Crear cuenta</Text>
        <View style={styles.form}>
          <Input label="Nombre" value={displayName} onChangeText={setDisplayName} placeholder="Tu nombre" />
          <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <Input label="Contraseña (mín. 8)" value={password} onChangeText={setPassword} secureTextEntry />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button label={loading ? 'Creando…' : 'Registrarse'} onPress={handleRegister} disabled={loading} />
        </View>
        <Link href="/(auth)/login" style={styles.link}>
          <Text style={styles.linkText}>Ya tengo cuenta</Text>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: spacing.xl, justifyContent: 'center', gap: spacing.xl },
  title: { ...typography.title, color: colors.text },
  form: { gap: spacing.lg },
  error: { ...typography.caption, color: colors.expense },
  link: { alignSelf: 'center' },
  linkText: { ...typography.body, color: colors.accent },
});
