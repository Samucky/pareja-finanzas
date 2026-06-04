import React, { Component, type ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    console.error('App error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.wrap}>
          <Text style={styles.title}>Algo salió mal</Text>
          <Text style={styles.sub}>Cierra la app y ábrela de nuevo.</Text>
          <Pressable style={styles.btn} onPress={() => this.setState({ hasError: false })}>
            <Text style={styles.btnText}>Reintentar</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  title: { ...typography.title, color: colors.text },
  sub: { ...typography.body, color: colors.textSecondary, marginTop: spacing.md, textAlign: 'center' },
  btn: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  btnText: { ...typography.subtitle, color: colors.background },
});
