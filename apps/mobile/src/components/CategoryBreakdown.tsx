import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { CATEGORY_LABELS, type ExpenseCategory } from '../types';
import { formatCurrency } from '../utils/format';

interface Props {
  breakdown: Record<string, number>;
}

const BAR_COLORS = ['#6EE7B7', '#A78BFA', '#60A5FA', '#FBBF24', '#F87171', '#94A3B8'];

export function CategoryBreakdown({ breakdown }: Props) {
  const entries = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  if (!total) return <Text style={styles.empty}>Sin gastos categorizados este mes</Text>;

  return (
    <View style={styles.wrap}>
      {entries.map(([key, value], i) => {
        const pct = Math.round((value / total) * 100);
        const label = CATEGORY_LABELS[key as ExpenseCategory] ?? key;
        return (
          <View key={key} style={styles.item}>
            <View style={styles.row}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.value}>
                {formatCurrency(value)} · {pct}%
              </Text>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  { width: `${pct}%`, backgroundColor: BAR_COLORS[i % BAR_COLORS.length] },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  item: { gap: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { ...typography.body, color: colors.text },
  value: { ...typography.caption, color: colors.textSecondary },
  track: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 3 },
  empty: { ...typography.body, color: colors.textSecondary },
});
