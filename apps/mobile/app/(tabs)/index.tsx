import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { Card } from '../../src/components/ui/Card';
import { api } from '../../src/services/api';
import { formatCurrency } from '../../src/utils/format';
import { useAuthStore } from '../../src/store/authStore';
import { useUiStore } from '../../src/store/uiStore';
import { ActivityList } from '../../src/components/ActivityList';
import { CategoryBreakdown } from '../../src/components/CategoryBreakdown';
import { ScreenLoader } from '../../src/components/ScreenLoader';

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const socketConnected = useUiStore((s) => s.socketConnected);
  const openModal = useUiStore((s) => s.openModal);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.getDashboard(),
  });

  const names = data?.members.map((m) => m.displayName).join(' & ') ?? user?.displayName;

  if (isLoading && !data) {
    return (
      <ScreenLoader message="Sincronizando finanzas" submessage="Conectando con tu pareja..." />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola,</Text>
            <Text style={styles.names}>{names}</Text>
          </View>
          <View style={styles.live}>
            <View style={[styles.dot, socketConnected && styles.dotOn]} />
            <Text style={styles.liveText}>{socketConnected ? 'En vivo' : 'Sin sync'}</Text>
          </View>
        </View>

        <Card style={styles.hero}>
          <Text style={styles.heroLabel}>Disponible en pareja</Text>
          <Text style={styles.heroAmount}>
            {isLoading ? '…' : formatCurrency(data?.balances.available ?? 0)}
          </Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryIncome}>↑ {formatCurrency(data?.monthSummary.income ?? 0)}</Text>
            <Text style={styles.summaryExpense}>↓ {formatCurrency(data?.monthSummary.expense ?? 0)}</Text>
          </View>
        </Card>

        <View style={styles.actions}>
          <Pressable style={styles.actionChip} onPress={() => openModal('income')}>
            <Text style={styles.actionText}>Ingreso</Text>
          </Pressable>
          <Pressable style={[styles.actionChip, styles.actionExpense]} onPress={() => openModal('expense')}>
            <Text style={styles.actionTextDark}>Gasto</Text>
          </Pressable>
          <Pressable style={[styles.actionChip, styles.actionAccent]} onPress={() => openModal('savings-deposit')}>
            <Text style={styles.actionTextDark}>Ahorro</Text>
          </Pressable>
        </View>

        <Text style={styles.section}>Gastos por categoría</Text>
        <Card>
          <CategoryBreakdown breakdown={data?.categoryBreakdown ?? {}} />
        </Card>

        <Text style={styles.section}>Actividad reciente</Text>
        <Card>
          <ActivityList
            items={(data?.recentActivity ?? []).map((a) => ({
              ...a,
              createdAt: typeof a.createdAt === 'string' ? a.createdAt : new Date(a.createdAt).toISOString(),
            }))}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { ...typography.body, color: colors.textSecondary },
  names: { ...typography.title, color: colors.text },
  live: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotOn: { backgroundColor: colors.primary },
  liveText: { ...typography.caption, color: colors.textSecondary },
  hero: { borderColor: 'rgba(110,231,183,0.3)' },
  heroLabel: { ...typography.caption, color: colors.textSecondary },
  heroAmount: { ...typography.hero, color: colors.primary, marginTop: spacing.sm },
  summaryRow: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.md },
  summaryIncome: { ...typography.caption, color: colors.income },
  summaryExpense: { ...typography.caption, color: colors.expense },
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionChip: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  actionExpense: { backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.expense },
  actionAccent: { backgroundColor: colors.accent },
  actionText: { ...typography.label, color: colors.background },
  actionTextDark: { ...typography.label, color: colors.text },
  section: { ...typography.subtitle, color: colors.text, marginTop: spacing.sm },
});
