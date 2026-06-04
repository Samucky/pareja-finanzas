import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAlertStore, type AlertVariant } from '../store/alertStore';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';

const variantConfig: Record<
  AlertVariant,
  { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }
> = {
  info: { icon: 'information-circle', color: colors.accent, bg: 'rgba(167,139,250,0.15)' },
  success: { icon: 'checkmark-circle', color: colors.primary, bg: 'rgba(110,231,183,0.15)' },
  warning: { icon: 'warning', color: '#FBBF24', bg: 'rgba(251,191,36,0.15)' },
  danger: { icon: 'trash', color: colors.expense, bg: 'rgba(248,113,113,0.15)' },
};

export function AppAlert() {
  const { visible, title, message, variant, confirmLabel, cancelLabel, onConfirm, onCancel, hide } =
    useAlertStore();
  const cfg = variantConfig[variant];

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={hide}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
            <Ionicons name={cfg.icon} size={32} color={cfg.color} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            {cancelLabel ? (
              <Pressable
                style={[styles.btn, styles.btnGhost]}
                onPress={() => {
                  onCancel?.();
                  hide();
                }}
              >
                <Text style={styles.btnGhostText}>{cancelLabel}</Text>
              </Pressable>
            ) : null}
            <Pressable
              style={[styles.btn, { backgroundColor: cfg.color }]}
              onPress={() => {
                onConfirm?.();
                hide();
              }}
            >
              <Text style={styles.btnText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
    width: '100%',
  },
  btn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  btnGhost: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.background,
  },
  btnGhostText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
});
