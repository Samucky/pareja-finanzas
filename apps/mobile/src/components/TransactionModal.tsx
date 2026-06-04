import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { api } from '../services/api';
import { useUiStore } from '../store/uiStore';
import { CATEGORY_LABELS, type ExpenseCategory } from '../types';
import { LoadingScreen } from './LoadingScreen';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ExpenseCategory[];

export function TransactionModal() {
  const modal = useUiStore((s) => s.modal);
  const closeModal = useUiStore((s) => s.closeModal);
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('comida');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const visible =
    modal === 'expense' || modal === 'income' || modal === 'savings-deposit' || modal === 'savings-withdraw';

  const mutation = useMutation({
    mutationFn: async () => {
      const value = parseFloat(amount.replace(',', '.'));
      if (!value || value <= 0) throw new Error('Importe inválido');

      if (modal === 'expense') {
        return api.createTransaction({ type: 'expense', amount: value, category, note: note || undefined });
      }
      if (modal === 'income') {
        return api.createTransaction({ type: 'income', amount: value, note: note || undefined });
      }
      if (modal === 'savings-deposit') {
        return api.savingsMovement({ type: 'deposit', amount: value, note: note || undefined });
      }
      return api.savingsMovement({ type: 'withdraw', amount: value, note: note || undefined });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['dashboard'], data.dashboard);
      setAmount('');
      setNote('');
      setError('');
      closeModal();
    },
    onError: (e: Error) => setError(e.message),
  });

  const titles: Record<string, string> = {
    expense: 'Nuevo gasto',
    income: 'Nuevo ingreso',
    'savings-deposit': 'Depositar en ahorro',
    'savings-withdraw': 'Retirar del ahorro',
  };

  if (!visible || !modal) return null;

  return (
    <>
    <Modal visible animationType="slide" transparent onRequestClose={closeModal}>
      <Pressable style={styles.overlay} onPress={closeModal}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            <Text style={styles.title}>{titles[modal]}</Text>

            <Input
              label="Importe (€)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0,00"
            />

            {modal === 'expense' && (
              <View style={styles.categories}>
                <Text style={styles.catLabel}>Categoría</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.catRow}>
                    {CATEGORIES.map((cat) => (
                      <Pressable
                        key={cat}
                        onPress={() => setCategory(cat)}
                        style={[styles.chip, category === cat && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                          {CATEGORY_LABELS[cat]}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            <Input label="Nota (opcional)" value={note} onChangeText={setNote} placeholder="Descripción breve" />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              label={mutation.isPending ? 'Guardando…' : 'Confirmar'}
              onPress={() => mutation.mutate()}
              disabled={mutation.isPending}
            />
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>

    <Modal visible={mutation.isPending} transparent animationType="fade">
      <LoadingScreen message="Guardando" submessage="Actualizando finanzas..." variant="boot" />
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, justifyContent: 'flex-end' },
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg + 8,
    borderTopRightRadius: radius.lg + 8,
    padding: spacing.xl,
    gap: spacing.lg,
    paddingBottom: spacing.xxxl + 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  title: { ...typography.title, color: colors.text },
  categories: { gap: spacing.sm },
  catLabel: { ...typography.label, color: colors.textSecondary },
  catRow: { flexDirection: 'row', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: 'rgba(110,231,183,0.15)' },
  chipText: { ...typography.caption, color: colors.textSecondary },
  chipTextActive: { color: colors.primary },
  error: { ...typography.caption, color: colors.expense },
});
