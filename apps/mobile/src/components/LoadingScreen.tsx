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
      <Image source={require('../../assets/icon.png')} style={styles.logo} resizeMode="contain" />
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
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 22,
    marginBottom: spacing.lg,
  },
  spinner: {
    marginVertical: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.sm,
  },
  sub: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxxl,
  },
  inlineText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
