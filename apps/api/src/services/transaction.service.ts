import { Transaction, EXPENSE_CATEGORIES, type TransactionType } from '../models/Transaction.js';
import { updateBalances } from './balance.service.js';
import { getDashboard } from './dashboard.service.js';
import { emitToCouple, CoupleEvents } from '../sockets/emitter.js';

export async function deleteTransaction(coupleId: string, transactionId: string) {
  const tx = await Transaction.findOne({ _id: transactionId, coupleId });
  if (!tx) throw new Error('NOT_FOUND');

  if (tx.type === 'income') {
    await updateBalances(coupleId, (b) => {
      if (b.liquid < tx.amount) throw new Error('INSUFFICIENT_LIQUID');
      return { ...b, liquid: b.liquid - tx.amount };
    });
  } else {
    await updateBalances(coupleId, (b) => ({
      ...b,
      liquid: b.liquid + tx.amount,
    }));
  }

  await tx.deleteOne();
  const dashboard = await getDashboard(coupleId);
  emitToCouple(coupleId, CoupleEvents.SYNC, dashboard);
  return dashboard;
}

export async function updateTransaction(
  coupleId: string,
  transactionId: string,
  body: {
    amount?: number;
    category?: string;
    note?: string;
  }
) {
  const tx = await Transaction.findOne({ _id: transactionId, coupleId });
  if (!tx) throw new Error('NOT_FOUND');

  const newAmount = body.amount ?? tx.amount;
  const newType = tx.type as TransactionType;

  if (newAmount <= 0) throw new Error('INVALID_AMOUNT');
  if (newType === 'expense' && body.category === undefined && !tx.category) {
    throw new Error('CATEGORY_REQUIRED');
  }

  // Revert old effect
  if (tx.type === 'income') {
    await updateBalances(coupleId, (b) => {
      if (b.liquid < tx.amount) throw new Error('INSUFFICIENT_LIQUID');
      return { ...b, liquid: b.liquid - tx.amount };
    });
  } else {
    await updateBalances(coupleId, (b) => ({
      ...b,
      liquid: b.liquid + tx.amount,
    }));
  }

  // Apply new effect
  if (newType === 'income') {
    await updateBalances(coupleId, (b) => ({
      ...b,
      liquid: b.liquid + newAmount,
    }));
  } else {
    await updateBalances(coupleId, (b) => {
      if (b.liquid < newAmount) throw new Error('INSUFFICIENT_LIQUID');
      return { ...b, liquid: b.liquid - newAmount };
    });
  }

  tx.amount = newAmount;
  if (body.category !== undefined) tx.category = body.category as typeof tx.category;
  if (body.note !== undefined) tx.note = body.note;
  await tx.save();

  const dashboard = await getDashboard(coupleId);
  emitToCouple(coupleId, CoupleEvents.SYNC, dashboard);
  return dashboard;
}
