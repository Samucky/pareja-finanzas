import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireCouple } from '../../middleware/auth.middleware.js';
import { SavingsMovement } from '../../models/SavingsMovement.js';
import { updateBalances } from '../../services/balance.service.js';
import { getDashboard } from '../../services/dashboard.service.js';
import { emitToCouple, CoupleEvents } from '../../sockets/emitter.js';

export const savingsRouter = Router();
savingsRouter.use(requireAuth, requireCouple);

const movementSchema = z.object({
  type: z.enum(['deposit', 'withdraw']),
  amount: z.number().positive(),
  note: z.string().max(200).optional(),
});

savingsRouter.post('/movement', async (req, res, next) => {
  try {
    const coupleId = req.auth!.coupleId!;
    const body = movementSchema.parse(req.body);

    if (body.type === 'deposit') {
      await updateBalances(coupleId, (b) => {
        if (b.liquid < body.amount) throw new Error('INSUFFICIENT_LIQUID');
        return {
          liquid: b.liquid - body.amount,
          savings: b.savings + body.amount,
          available: b.liquid - body.amount,
        };
      });
    } else {
      await updateBalances(coupleId, (b) => {
        if (b.savings < body.amount) throw new Error('INSUFFICIENT_SAVINGS');
        return {
          liquid: b.liquid + body.amount,
          savings: b.savings - body.amount,
          available: b.liquid + body.amount,
        };
      });
    }

    const movement = await SavingsMovement.create({
      coupleId,
      userId: req.auth!.userId,
      type: body.type,
      amount: body.amount,
      note: body.note,
    });

    const dashboard = await getDashboard(coupleId);
    emitToCouple(coupleId, CoupleEvents.SAVINGS_MOVEMENT, { movementId: movement._id.toString() });
    emitToCouple(coupleId, CoupleEvents.BALANCE_UPDATED, dashboard.balances);
    emitToCouple(coupleId, CoupleEvents.SYNC, dashboard);

    res.status(201).json({ movement, dashboard });
  } catch (e) {
    next(e);
  }
});

savingsRouter.get('/movements', async (req, res, next) => {
  try {
    const movements = await SavingsMovement.find({ coupleId: req.auth!.coupleId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ movements });
  } catch (e) {
    next(e);
  }
});
