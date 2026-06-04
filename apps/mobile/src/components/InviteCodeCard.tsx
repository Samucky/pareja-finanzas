import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';
import { api } from '../services/api';
import { formatInviteExpiry } from '../utils/format';
import { showAlert } from '../store/alertStore';
import { useResponsive } from '../theme/layout';

interface Props {
  inviteCode: string;
  inviteExpiresAt: string;
  memberCount: number;
  compact?: boolean;
}

export function InviteCodeCard({ inviteCode, inviteExpiresAt, memberCount, compact }: Props) {
  const queryClient = useQueryClient();
  const { maxContentWidth } = useResponsive();
  const [code, setCode] = useState(inviteCode);
  const [expiresAt, setExpiresAt] = useState(inviteExpiresAt);
  const isFull = memberCount >= 2;

  const regenerate = useMutation({
    mutationFn: () => api.regenerateInvite(),
    onSuccess: (data) => {
      setCode(data.inviteCode);
      setExpiresAt(data.inviteExpiresAt);
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showAlert({
        title: 'Código nuevo',
        message: 'Válido 24 horas. Envíaselo a tu pareja para que cree su cuenta y se una.',
        variant: 'success',
        confirmLabel: 'Entendido',
      });
    },
    onError: (e: Error) => {
      showAlert({ title: 'Error', message: e.message, variant: 'danger' });
    },
  });

  async function copyCode() {
    await Clipboard.setStringAsync(code);
    showAlert({
      title: 'Copiado',
      message: 'El código está en el portapapeles.',
      variant: 'success',
      confirmLabel: 'OK',
    });
  }

  async function shareCode() {
    await Share.share({
      message: `Únete a nuestras finanzas en Pareja Finanzas.\nCódigo: ${code}\nVálido hasta: ${formatInviteExpiry(expiresAt)}\nDescarga la app e ingresa el código al registrarte.`,
    });
  }

  if (isFull && compact) return null;

  return (
    <Card style={{ maxWidth: maxContentWidth, alignSelf: 'center', width: '100%' }} accent>
      <View style={styles.header}>
        <Ionicons name="people" size={22} color={colors.accent} />
        <Text style={styles.title}>{isFull ? 'Pareja vinculada' : 'Invita a tu pareja'}</Text>
      </View>
      {!isFull ? (
        <>
          <Text style={styles.sub}>
            Genera un código válido 24 h. Tu pareja lo usa al crear su cuenta en «Unirse con código».
          </Text>
          <View style={styles.codeBox}>
            <Text style={styles.code}>{code}</Text>
          </View>
          <Text style={styles.expiry}>Expira: {formatInviteExpiry(expiresAt)}</Text>
          <View style={styles.row}>
            <Pressable style={styles.iconBtn} onPress={copyCode}>
              <Ionicons name="copy-outline" size={20} color={colors.text} />
              <Text style={styles.iconBtnText}>Copiar</Text>
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={shareCode}>
              <Ionicons name="share-social-outline" size={20} color={colors.text} />
              <Text style={styles.iconBtnText}>Enviar</Text>
            </Pressable>
          </View>
          <Button
            label={regenerate.isPending ? 'Generando...' : 'Generar código nuevo (24 h)'}
            onPress={() => regenerate.mutate()}
            disabled={regenerate.isPending}
            variant="secondary"
            style={{ marginTop: spacing.md }}
          />
        </>
      ) : (
        <Text style={styles.sub}>Los dos ya están conectados. ¡A controlar gastos juntos!</Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { fontSize: 17, fontWeight: '600', color: colors.text },
  sub: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 19 },
  codeBox: {
    marginTop: spacing.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
  },
  code: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 6,
  },
  expiry: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  iconBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBtnText: { fontSize: 14, fontWeight: '500', color: colors.text },
});
