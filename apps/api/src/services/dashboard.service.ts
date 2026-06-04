import { Couple } from '../models/Couple.js';
import { Transaction } from '../models/Transaction.js';
import { SavingsMovement } from '../models/SavingsMovement.js';
import { User } from '../models/User.js';
import { readBalances } from './balance.service.js';

export async function getDashboard(coupleId: string) {
  const couple = await Couple.findById(coupleId);
  if (!couple) throw new Error('Couple not found');

  const balances = readBalances(couple);
  const members = await User.find({ _id: { $in: couple.members } }).select('displayName email');
  const transactions = await Transaction.find({ coupleId })
    .sort({ createdAt: -1 })
    .limit(30)
    .populate('userId', 'displayName');
  const savingsMovements = await SavingsMovement.find({ coupleId })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('userId', 'displayName');

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthTx = await Transaction.find({
    coupleId,
    createdAt: { $gte: monthStart },
  });

  const monthIncome = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const monthExpense = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const byCategory: Record<string, number> = {};
  monthTx
    .filter((t) => t.type === 'expense' && t.category)
    .forEach((t) => {
      const cat = t.category as string;
      byCategory[cat] = (byCategory[cat] ?? 0) + t.amount;
    });

  return {
    couple: {
      id: couple._id.toString(),
      name: couple.name,
      inviteCode: couple.inviteCode,
      inviteExpiresAt: couple.inviteExpiresAt,
      memberCount: couple.members.length,
    },
    balances,
    monthSummary: { income: monthIncome, expense: monthExpense },
    categoryBreakdown: byCategory,
    members: members.map((m) => ({
      id: m._id.toString(),
      displayName: m.displayName,
      email: m.email,
    })),
    recentActivity: [
      ...transactions.map((t) => ({
        id: t._id.toString(),
        kind: 'transaction' as const,
        type: t.type,
        amount: t.amount,
        category: t.category,
        note: t.note,
        userName: (t.userId as { displayName?: string })?.displayName ?? 'Usuario',
        createdAt: t.createdAt,
      })),
      ...savingsMovements.map((s) => ({
        id: s._id.toString(),
        kind: 'savings' as const,
        type: s.type,
        amount: s.amount,
        note: s.note,
        userName: (s.userId as { displayName?: string })?.displayName ?? 'Usuario',
        createdAt: s.createdAt,
      })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 30),
  };
}
