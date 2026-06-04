import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { api } from '../../src/services/api';
import { formatCurrency } from '../../src/utils/format';
import { useUiStore } from '../../src/store/uiStore';
import { ActivityList } from '../../src/components/ActivityList';

export default function SavingsScreen() {
  const openModal = useUiStore((s) => s.openModal);
  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.getDashboard(),
  });

  const savingsItems = (data?.recentActivity ?? []).filter((a) => a.kind === 'savings');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.accent} />}
      >
        <Text style={styles.title}>Ahorro compartido</Text>
        <Text style={styles.sub}>Separado del gasto diario · afecta el disponible</Text>

        <Card accent>
          <Text style={styles.balanceLabel}>Total en fondo</Text>
          <Text style={styles.balance}>{formatCurrency(data?.balances.savings ?? 0)}</Text>
          <Text style={styles.liquid}>Disponible líquido: {formatCurrency(data?.balances.liquid ?? 0)}</Text>
        </Card>

        <View style={styles.row}>
          <Button label="Depositar" onPress={() => openModal('savings-deposit')} style={styles.half} />
          <Button label="Retirar" onPress={() => openModal('savings-withdraw')} variant="secondary" style={styles.half} />
        </View>

        <Text style={styles.section}>Movimientos del fondo</Text>
        <Card>
          <ActivityList
            items={savingsItems.map((a) => ({
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
  container: { padding: spacing.xl, gap: spacing.lg },
  title: { ...typography.title, color: colors.text },
  sub: { ...typography.caption, color: colors.textSecondary, marginTop: -spacing.sm },
  balanceLabel: { ...typography.caption, color: colors.textSecondary },
  balance: { ...typography.hero, color: colors.accent, fontSize: 34, marginTop: spacing.sm },
  liquid: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
  section: { ...typography.subtitle, color: colors.text },
});
