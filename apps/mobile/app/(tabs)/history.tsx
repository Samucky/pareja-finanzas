import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { Card } from '../../src/components/ui/Card';
import { api } from '../../src/services/api';
import { ActivityList } from '../../src/components/ActivityList';
import { ScreenLoader } from '../../src/components/ScreenLoader';

export default function HistoryScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.getDashboard(),
  });

  if (isLoading && !data) {
    return <ScreenLoader message="Cargando historial" submessage="Recuperando movimientos..." />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <Text style={styles.title}>Historial</Text>
        <Text style={styles.sub}>Todos los movimientos de la pareja</Text>
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
  container: { padding: spacing.xl, gap: spacing.lg },
  title: { ...typography.title, color: colors.text },
  sub: { ...typography.caption, color: colors.textSecondary, marginTop: -spacing.sm },
});
