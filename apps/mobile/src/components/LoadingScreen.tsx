import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type Variant = 'boot' | 'page' | 'inline';

interface Props {
  message?: string;
  submessage?: string;
  variant?: Variant;
}

export function LoadingScreen({
  message = 'Cargando',
  submessage,
  variant = 'page',
}: Props) {
  if (variant === 'inline') {
    return (
      <View style={styles.inline}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.inlineText}>{message}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, variant === 'boot' && styles.boot]}>
      <View style={styles.glowTop} />
      <Image source={require('../../assets/icon.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.brand}>Pareja Finanzas</Text>
      <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      <Text style={styles.title}>{message}</Text>
      {submessage ? <Text style={styles.sub}>{submessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  boot: {
    ...StyleSheet.absoluteFill,
    zIndex: 999,
  },
  glowTop: {
    position: 'absolute',
    top: '15%',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary,
    opacity: 0.08,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 24,
    marginBottom: spacing.md,
  },
  brand: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.lg,
  },
  spinner: { marginVertical: spacing.md },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  sub: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxxl,
  },
  inlineText: { fontSize: 14, color: colors.textSecondary },
});
