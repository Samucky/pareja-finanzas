import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';
import type { ActivityItem } from '../types';
import { CATEGORY_LABELS, type ExpenseCategory } from '../types';
import { formatCurrency, formatRelativeTime } from '../utils/format';

interface Props {
  items: ActivityItem[];
  editable?: boolean;
  onEdit?: (item: ActivityItem) => void;
  onDelete?: (item: ActivityItem) => void;
}

export function ActivityList({ items, editable, onEdit, onDelete }: Props) {
  if (!items.length) {
    return <Text style={styles.empty}>Aún no hay movimientos</Text>;
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
        const canEdit = editable && item.kind === 'transaction' && onEdit && onDelete;

        return (
          <View key={item.id} style={styles.row}>
            <View style={[styles.badge, isIncome ? styles.badgeIncome : styles.badgeExpense]}>
              <Ionicons
                name={isIncome ? 'arrow-down' : 'arrow-up'}
                size={14}
                color={isIncome ? colors.income : colors.expense}
              />
            </View>
            <View style={styles.left}>
              <Text style={styles.name} numberOfLines={1}>
                {item.userName}
              </Text>
              <Text style={styles.meta} numberOfLines={2}>
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
              {canEdit ? (
                <View style={styles.actions}>
                  <Pressable style={styles.actionBtn} onPress={() => onEdit(item)} hitSlop={8}>
                    <Ionicons name="pencil" size={16} color={colors.accent} />
                  </Pressable>
                  <Pressable style={styles.actionBtn} onPress={() => onDelete(item)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={16} color={colors.expense} />
                  </Pressable>
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  badgeIncome: { backgroundColor: 'rgba(110,231,183,0.12)' },
  badgeExpense: { backgroundColor: 'rgba(248,113,113,0.12)' },
  left: { flex: 1, marginRight: spacing.sm, minWidth: 0 },
  right: { alignItems: 'flex-end', maxWidth: '42%' },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  meta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  amount: { fontSize: 15, fontWeight: '600' },
  income: { color: colors.income },
  expense: { color: colors.expense },
  time: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  actionBtn: {
    padding: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
  },
  empty: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', paddingVertical: spacing.xxl },
});
