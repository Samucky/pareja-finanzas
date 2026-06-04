import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal } from 'react-native';
import { LoadingScreen } from '../../src/components/LoadingScreen';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { api } from '../../src/services/api';
import { saveTokens } from '../../src/services/authStorage';
import { useAuthStore } from '../../src/store/authStore';
import { useRouter } from 'expo-router';

export default function CoupleSetupScreen() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const [code, setCode] = useState('');
  const [inviteCode, setInviteCode] = useState<string | null>(null);
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
      router.replace('/(tabs)');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error';
      const map: Record<string, string> = {
        INVALID_CODE: 'C?digo no v?lido',
        CODE_EXPIRED: 'C?digo expirado',
        COUPLE_FULL: 'La pareja ya est? completa',
      };
      setError(map[msg] ?? msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Vincular pareja</Text>
      <Text style={styles.sub}>Comparte finanzas en tiempo real con tu pareja</Text>

      <Card>
        <Text style={styles.cardTitle}>Crear espacio nuevo</Text>
        <Text style={styles.cardSub}>Obtendr?s un c?digo de 6 caracteres v?lido 24h</Text>
        <Button label={loading ? 'ÿÿÿ' : 'Crear pareja'} onPress={createCouple} disabled={loading} style={{ marginTop: spacing.md }} />
        {inviteCode ? (
          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>C?digo para tu pareja</Text>
            <Text style={styles.code}>{inviteCode}</Text>
            <Button label="Ir al inicio" onPress={() => router.replace('/(tabs)')} variant="secondary" style={{ marginTop: spacing.md }} />
          </View>
        ) : null}
      </Card>

      <Card style={{ marginTop: spacing.lg }}>
        <Text style={styles.cardTitle}>Unirse con c?digo</Text>
        <Input label="C?digo de invitaci?n" value={code} onChangeText={setCode} autoCapitalize="characters" maxLength={6} />
        <Button label="Unirse" onPress={joinCouple} variant="secondary" disabled={loading || code.length < 6} />
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </ScrollView>

    <Modal visible={loading} transparent animationType="fade">
      <LoadingScreen message="Vinculando pareja" submessage="Un momento..." variant="boot" />
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, gap: spacing.lg, flexGrow: 1 },
  title: { ...typography.title, color: colors.text },
  sub: { ...typography.body, color: colors.textSecondary },
  cardTitle: { ...typography.subtitle, color: colors.text },
  cardSub: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  codeBox: { marginTop: spacing.lg, alignItems: 'center' },
  codeLabel: { ...typography.caption, color: colors.textSecondary },
  code: { ...typography.hero, color: colors.accent, fontSize: 28, letterSpacing: 4, marginTop: spacing.sm },
  error: { ...typography.caption, color: colors.expense, textAlign: 'center' },
});
