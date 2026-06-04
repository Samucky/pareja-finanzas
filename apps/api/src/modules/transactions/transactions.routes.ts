import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireCouple } from '../../middleware/auth.middleware.js';
import { Transaction, EXPENSE_CATEGORIES } from '../../models/Transaction.js';
import { updateBalances } from '../../services/balance.service.js';
import { getDashboard } from '../../services/dashboard.service.js';
import { emitToCouple, CoupleEvents } from '../../sockets/emitter.js';

export const transactionsRouter = Router();
transactionsRouter.use(requireAuth, requireCouple);

const createSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive(),
  category: z.enum(EXPENSE_CATEGORIES).optional(),
  note: z.string().max(200).optional(),
  paidBy: z.string().max(40).optional(),
});

transactionsRouter.post('/', async (req, res, next) => {
  try {
    const coupleId = req.auth!.coupleId!;
    const body = createSchema.parse(req.body);
    if (body.type === 'expense' && !body.category) {
      res.status(400).json({ error: 'La categoría es obligatoria para gastos' });
      return;
    }

    if (body.type === 'expense') {
      await updateBalances(coupleId, (b) => {
        if (b.liquid < body.amount) throw new Error('INSUFFICIENT_LIQUID');
        return { ...b, liquid: b.liquid - body.amount };
      });
    } else {
      await updateBalances(coupleId, (b) => ({
        ...b,
        liquid: b.liquid + body.amount,
      }));
    }

    const tx = await Transaction.create({
      coupleId,
      userId: req.auth!.userId,
      type: body.type,
      amount: body.amount,
      category: body.category,
      note: body.note,
      paidBy: body.paidBy,
    });

    const dashboard = await getDashboard(coupleId);
    emitToCouple(coupleId, CoupleEvents.TRANSACTION_CREATED, { transactionId: tx._id.toString() });
    emitToCouple(coupleId, CoupleEvents.BALANCE_UPDATED, dashboard.balances);
    emitToCouple(coupleId, CoupleEvents.SYNC, dashboard);

    res.status(201).json({ transaction: tx, dashboard });
  } catch (e) {
    next(e);
  }
});

transactionsRouter.get('/', async (req, res, next) => {
  try {
    const list = await Transaction.find({ coupleId: req.auth!.coupleId })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ transactions: list });
  } catch (e) {
    next(e);
  }
});
