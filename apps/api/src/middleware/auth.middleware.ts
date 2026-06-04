import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/jwt.service.js';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    req.auth = verifyAccessToken(header.slice(7));
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireCouple(req: Request, res: Response, next: NextFunction): void {
  if (!req.auth?.coupleId) {
    res.status(403).json({ error: 'Debes vincular o crear una pareja primero' });
    return;
  }
  next();
}
