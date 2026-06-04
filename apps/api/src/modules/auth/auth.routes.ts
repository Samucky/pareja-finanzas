import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { User } from '../../models/User.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../services/jwt.service.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(40),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authRouter = Router();

authRouter.use(authLimiter);

authRouter.post('/register', async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const exists = await User.findOne({ email: body.email });
    if (exists) {
      res.status(409).json({ error: 'Email ya registrado' });
      return;
    }
    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await User.create({
      email: body.email,
      passwordHash,
      displayName: body.displayName,
    });
    const auth = {
      userId: user._id.toString(),
      coupleId: null,
      email: user.email,
    };
    res.status(201).json({
      user: { id: auth.userId, email: user.email, displayName: user.displayName, coupleId: null },
      accessToken: signAccessToken(auth),
      refreshToken: signRefreshToken(auth),
    });
  } catch (e) {
    next(e);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await User.findOne({ email: body.email });
    if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }
    const auth = {
      userId: user._id.toString(),
      coupleId: user.coupleId?.toString() ?? null,
      email: user.email,
    };
    res.json({
      user: {
        id: auth.userId,
        email: user.email,
        displayName: user.displayName,
        coupleId: auth.coupleId,
      },
      accessToken: signAccessToken(auth),
      refreshToken: signRefreshToken(auth),
    });
  } catch (e) {
    next(e);
  }
});

authRouter.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);
    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findById(payload.userId);
    if (!user) {
      res.status(401).json({ error: 'Usuario no encontrado' });
      return;
    }
    const auth = {
      userId: user._id.toString(),
      coupleId: user.coupleId?.toString() ?? null,
      email: user.email,
    };
    res.json({
      accessToken: signAccessToken(auth),
      refreshToken: signRefreshToken(auth),
    });
  } catch (e) {
    next(e);
  }
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.auth!.userId);
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    res.json({
      id: user._id.toString(),
      email: user.email,
      displayName: user.displayName,
      coupleId: user.coupleId?.toString() ?? null,
    });
  } catch (e) {
    next(e);
  }
});
