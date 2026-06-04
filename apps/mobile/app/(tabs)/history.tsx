import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { Card } from '../../src/components/ui/Card';
import { api } from '../../src/services/api';
import { ActivityList } from '../../src/components/ActivityList';
import { ScreenLoader } from '../../src/components/ScreenLoader';
import { useUiStore } from '../../src/store/uiStore';
import { confirmAlert, showAlert } from '../../src/store/alertStore';
import { useResponsive } from '../../src/theme/layout';
import type { ActivityItem } from '../../src/types';

export default function HistoryScreen() {
  const queryClient = useQueryClient();
  const openEdit = useUiStore((s) => s.openEditTransaction);
  const { contentPadding, maxContentWidth } = useResponsive();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.getDashboard(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteTransaction(id),
    onSuccess: (res) => {
      queryClient.setQueryData(['dashboard'], res.dashboard);
      showAlert({
        title: 'Eliminado',
        message: 'El movimiento se eliminó y el saldo se actualizó.',
        variant: 'success',
        confirmLabel: 'OK',
      });
    },
    onError: (e: Error) => {
      showAlert({ title: 'No se pudo eliminar', message: e.message, variant: 'danger' });
    },
  });

  async function handleDelete(item: ActivityItem) {
    const ok = await confirmAlert({
      title: '¿Eliminar movimiento?',
      message: `Se quitará ${item.type === 'income' ? 'el ingreso' : 'el gasto'} de $${item.amount.toFixed(2)} MXN del historial.`,
      variant: 'danger',
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar',
    });
    if (ok) deleteMutation.mutate(item.id);
  }

  const items = (data?.recentActivity ?? []).map((a) => ({
    ...a,
    createdAt: typeof a.createdAt === 'string' ? a.createdAt : new Date(a.createdAt).toISOString(),
  }));

  if (isLoading && !data) {
    return <ScreenLoader message="Cargando historial" submessage="Recuperando movimientos..." />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingHorizontal: contentPadding }]}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <View style={{ maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' }}>
          <Text style={styles.title}>Historial</Text>
          <Text style={styles.sub}>Toca editar o eliminar un ingreso o gasto</Text>
          <Card>
            <ActivityList
              items={items}
              editable
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { paddingBottom: spacing.xxxl, gap: spacing.lg, paddingTop: spacing.md },
  title: { fontSize: 22, fontWeight: '600', color: colors.text },
  sub: { fontSize: 13, color: colors.textSecondary, marginTop: -spacing.sm },
});
