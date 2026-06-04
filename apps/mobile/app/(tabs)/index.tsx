import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { Card } from '../../src/components/ui/Card';
import { api } from '../../src/services/api';
import { formatCurrency } from '../../src/utils/format';
import { useAuthStore } from '../../src/store/authStore';
import { useUiStore } from '../../src/store/uiStore';
import { ActivityList } from '../../src/components/ActivityList';
import { CategoryBreakdown } from '../../src/components/CategoryBreakdown';
import { ScreenLoader } from '../../src/components/ScreenLoader';
import { InviteCodeCard } from '../../src/components/InviteCodeCard';
import { useResponsive } from '../../src/theme/layout';

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const socketConnected = useUiStore((s) => s.socketConnected);
  const openModal = useUiStore((s) => s.openModal);
  const { contentPadding, maxContentWidth, isSmall } = useResponsive();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.getDashboard(),
  });

  const names = data?.members.map((m) => m.displayName).join(' & ') ?? user?.displayName;
  const memberCount = data?.couple.memberCount ?? data?.members.length ?? 1;

  if (isLoading && !data) {
    return <ScreenLoader message="Sincronizando finanzas" submessage="Conectando con tu pareja..." />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingHorizontal: contentPadding }]}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <View style={[styles.inner, { maxWidth: maxContentWidth }]}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>Hola,</Text>
              <Text style={styles.names} numberOfLines={2}>
                {names}
              </Text>
            </View>
            <View style={styles.live}>
              <View style={[styles.dot, socketConnected && styles.dotOn]} />
              <Text style={styles.liveText}>{socketConnected ? 'En vivo' : 'Sin sync'}</Text>
            </View>
          </View>

          {data?.couple.inviteCode && data.couple.inviteExpiresAt && memberCount < 2 ? (
            <InviteCodeCard
              inviteCode={data.couple.inviteCode}
              inviteExpiresAt={
                typeof data.couple.inviteExpiresAt === 'string'
                  ? data.couple.inviteExpiresAt
                  : new Date(data.couple.inviteExpiresAt).toISOString()
              }
              memberCount={memberCount}
            />
          ) : null}

          <Card style={styles.hero}>
            <Text style={styles.heroLabel}>Disponible en pareja</Text>
            <Text style={[styles.heroAmount, isSmall && styles.heroAmountSmall]}>
              {formatCurrency(data?.balances.available ?? 0)}
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
                createdAt:
                  typeof a.createdAt === 'string' ? a.createdAt : new Date(a.createdAt).toISOString(),
              }))}
            />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { paddingBottom: spacing.xxxl, paddingTop: spacing.md },
  inner: { width: '100%', alignSelf: 'center', gap: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md },
  headerText: { flex: 1, minWidth: 0 },
  greeting: { fontSize: 14, color: colors.textSecondary },
  names: { fontSize: 22, fontWeight: '600', color: colors.text },
  live: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexShrink: 0 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotOn: { backgroundColor: colors.primary },
  liveText: { fontSize: 11, color: colors.textSecondary },
  hero: { borderColor: 'rgba(110,231,183,0.35)' },
  heroLabel: { fontSize: 12, color: colors.textSecondary },
  heroAmount: { fontSize: 36, fontWeight: '700', color: colors.primary, marginTop: spacing.sm },
  heroAmountSmall: { fontSize: 28 },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, marginTop: spacing.md },
  summaryIncome: { fontSize: 12, color: colors.income },
  summaryExpense: { fontSize: 12, color: colors.expense },
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionChip: {
    flex: 1,
    minWidth: 90,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  actionExpense: { backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.expense },
  actionAccent: { backgroundColor: colors.accent },
  actionText: { fontSize: 13, fontWeight: '600', color: colors.background },
  actionTextDark: { fontSize: 13, fontWeight: '600', color: colors.text },
  section: { fontSize: 16, fontWeight: '600', color: colors.text, marginTop: spacing.sm },
});
