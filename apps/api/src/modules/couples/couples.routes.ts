import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { createCouple, joinCoupleByCode } from '../../services/couple.service.js';
import { User } from '../../models/User.js';
import { signAccessToken, signRefreshToken } from '../../services/jwt.service.js';

export const couplesRouter = Router();
couplesRouter.use(requireAuth);

couplesRouter.post('/create', async (req, res, next) => {
  try {
    const user = await User.findById(req.auth!.userId);
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    if (user.coupleId) {
      res.status(409).json({ error: 'Ya perteneces a una pareja' });
      return;
    }
    const { name } = z.object({ name: z.string().min(2).max(60).optional() }).parse(req.body);
    const couple = await createCouple(name ?? `${user.displayName} & pareja`, req.auth!.userId);
    const auth = {
      userId: user._id.toString(),
      coupleId: couple._id.toString(),
      email: user.email,
    };
    res.status(201).json({
      user: {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
        coupleId: couple._id.toString(),
      },
      couple: {
        id: couple._id.toString(),
        name: couple.name,
        inviteCode: couple.inviteCode,
        inviteExpiresAt: couple.inviteExpiresAt,
      },
      accessToken: signAccessToken(auth),
      refreshToken: signRefreshToken(auth),
    });
  } catch (e) {
    next(e);
  }
});

couplesRouter.post('/join', async (req, res, next) => {
  try {
    const user = await User.findById(req.auth!.userId);
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    if (user.coupleId) {
      res.status(409).json({ error: 'Ya perteneces a una pareja' });
      return;
    }
    const { code } = z.object({ code: z.string().length(6) }).parse(req.body);
    const couple = await joinCoupleByCode(req.auth!.userId, code);
    const auth = {
      userId: user._id.toString(),
      coupleId: couple._id.toString(),
      email: user.email,
    };
    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
        coupleId: couple._id.toString(),
      },
      couple: {
        id: couple._id.toString(),
        name: couple.name,
        inviteCode: couple.inviteCode,
      },
      accessToken: signAccessToken(auth),
      refreshToken: signRefreshToken(auth),
    });
  } catch (e) {
    if (e instanceof Error && ['INVALID_CODE', 'CODE_EXPIRED', 'COUPLE_FULL', 'ALREADY_MEMBER'].includes(e.message)) {
      next(e);
      return;
    }
    next(e);
  }
});
