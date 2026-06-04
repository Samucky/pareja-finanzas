import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LoadingScreen } from '../../src/components/LoadingScreen';
import { InviteCodeCard } from '../../src/components/InviteCodeCard';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { api } from '../../src/services/api';
import { saveTokens } from '../../src/services/authStorage';
import { useAuthStore } from '../../src/store/authStore';
import { useResponsive } from '../../src/theme/layout';
import { showAlert } from '../../src/store/alertStore';

export default function CoupleSetupScreen() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const { contentPadding, maxContentWidth, isSmall } = useResponsive();

  const [code, setCode] = useState('');
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteExpiresAt, setInviteExpiresAt] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function createCouple() {
    setLoading(true);
    setError('');
    try {
      const res = await api.createCouple(`${user?.displayName ?? 'Mi'} pareja`);
      await saveTokens(res.accessToken, res.refreshToken);
      setUser(res.user);
      setInviteCode(res.couple.inviteCode);
      setInviteExpiresAt(res.couple.inviteExpiresAt ?? new Date(Date.now() + 86400000).toISOString());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  async function joinCouple() {
    setLoading(true);
    setError('');
    try {
      const res = await api.joinCouple(code.trim());
      await saveTokens(res.accessToken, res.refreshToken);
      setUser(res.user);
      showAlert({
        title: '¡Vinculados!',
        message: 'Ya comparten finanzas en tiempo real.',
        variant: 'success',
        confirmLabel: 'Ir al inicio',
        onConfirm: () => router.replace('/(tabs)'),
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error';
      const map: Record<string, string> = {
        INVALID_CODE: 'Código no válido',
        CODE_EXPIRED: 'Código expirado. Pide uno nuevo a tu pareja.',
        COUPLE_FULL: 'La pareja ya está completa',
      };
      setError(map[msg] ?? msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.container, { paddingHorizontal: contentPadding }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.inner, { maxWidth: maxContentWidth }]}>
            <Image source={require('../../assets/icon.png')} style={[styles.logo, isSmall && styles.logoSmall]} />
            <Text style={styles.title}>Vincular pareja</Text>
            <Text style={styles.sub}>Crea tu espacio y comparte el código 24 h con tu pareja</Text>

            {inviteCode && inviteExpiresAt ? (
              <InviteCodeCard
                inviteCode={inviteCode}
                inviteExpiresAt={inviteExpiresAt}
                memberCount={1}
              />
            ) : (
              <Card>
                <Text style={styles.cardTitle}>1. Crear espacio</Text>
                <Text style={styles.cardSub}>Genera un código de 6 caracteres válido 24 horas</Text>
                <Button
                  label={loading ? 'Creando...' : 'Crear y generar código'}
                  onPress={createCouple}
                  disabled={loading}
                  style={{ marginTop: spacing.md }}
                />
              </Card>
            )}

            {!inviteCode ? (
              <Card style={{ marginTop: spacing.lg }}>
                <Text style={styles.cardTitle}>2. ¿Ya tienes código?</Text>
                <Text style={styles.cardSub}>Tu pareja te lo envió después de crear su cuenta</Text>
                <Input
                  label="Código de invitación"
                  value={code}
                  onChangeText={setCode}
                  autoCapitalize="characters"
                  maxLength={6}
                  placeholder="ABC123"
                />
                <Button
                  label="Unirse"
                  onPress={joinCouple}
                  variant="secondary"
                  disabled={loading || code.length < 6}
                />
              </Card>
            ) : (
              <Button
                label="Continuar al inicio"
                onPress={() => router.replace('/(tabs)')}
                style={{ marginTop: spacing.lg }}
              />
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={loading} transparent animationType="fade">
        <LoadingScreen message="Vinculando pareja" submessage="Un momento..." variant="boot" />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  container: { flexGrow: 1, paddingVertical: spacing.xl, alignItems: 'center' },
  inner: { width: '100%', gap: spacing.lg },
  logo: { width: 80, height: 80, borderRadius: 20, alignSelf: 'center' },
  logoSmall: { width: 64, height: 64 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, textAlign: 'center' },
  sub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardSub: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 18 },
  error: { fontSize: 13, color: colors.expense, textAlign: 'center' },
});
