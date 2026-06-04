import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { ActivityItem } from '../types';
import { CATEGORY_LABELS, type ExpenseCategory } from '../types';
import { formatCurrency, formatRelativeTime } from '../utils/format';

interface Props {
  items: ActivityItem[];
}

export function ActivityList({ items }: Props) {
  if (!items.length) {
    return <Text style={styles.empty}>Aún no hay movimientos este mes</Text>;
  }

  return (
    <View style={styles.list}>
      {items.map((item) => {
        const isIncome = item.type === 'income' || item.type === 'deposit';
        const sign = isIncome ? '+' : '-';
        const label =
          item.kind === 'savings'
            ? item.type === 'deposit'
              ? 'Depósito ahorro'
              : 'Retiro ahorro'
            : item.type === 'expense' && item.category
              ? CATEGORY_LABELS[item.category as ExpenseCategory]
              : item.type === 'income'
                ? 'Ingreso'
                : 'Gasto';

        return (
          <View key={item.id} style={styles.row}>
            <View style={styles.left}>
              <Text style={styles.name}>{item.userName}</Text>
              <Text style={styles.meta}>
                {label}
                {item.note ? ` · ${item.note}` : ''}
              </Text>
            </View>
            <View style={styles.right}>
              <Text style={[styles.amount, isIncome ? styles.income : styles.expense]}>
                {sign}
                {formatCurrency(item.amount)}
              </Text>
              <Text style={styles.time}>{formatRelativeTime(item.createdAt)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  left: { flex: 1, marginRight: spacing.md },
  right: { alignItems: 'flex-end' },
  name: { ...typography.subtitle, color: colors.text, fontSize: 15 },
  meta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  amount: { ...typography.subtitle, fontSize: 15 },
  income: { color: colors.income },
  expense: { color: colors.expense },
  time: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center', paddingVertical: spacing.xxl },
});
