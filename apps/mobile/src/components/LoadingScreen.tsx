import { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

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
  const pulse = useSharedValue(1);
  const glow = useSharedValue(0.4);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    glow.value = withRepeat(withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [pulse, glow]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 0.95 + glow.value * 0.1 }],
  }));

  if (variant === 'inline') {
    return (
      <View style={styles.inline}>
        <Animated.View style={[styles.inlineDot, ringStyle]} />
        <Text style={styles.inlineText}>{message}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, variant === 'boot' && styles.boot]}>
      <View style={styles.glowBg} />
      <Animated.View style={[styles.ring, ringStyle]} />
      <Animated.View style={logoStyle}>
        <Image source={require('../../assets/icon.png')} style={styles.logo} resizeMode="contain" />
      </Animated.View>

      <Text style={styles.title}>{message}</Text>
      {submessage ? <Text style={styles.sub}>{submessage}</Text> : null}

      <View style={styles.dots}>
        <LoadingDot delay={0} />
        <LoadingDot delay={200} />
        <LoadingDot delay={400} />
      </View>
    </View>
  );
}

function LoadingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    const start = () => {
      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.35, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    };
    const t = setTimeout(start, delay);
    return () => clearTimeout(t);
  }, [delay, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.dot, style]} />;
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  glowBg: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.primary,
    opacity: 0.06,
  },
  ring: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 22,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.xxl,
  },
  sub: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xxl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxxl,
  },
  inlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  inlineText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
