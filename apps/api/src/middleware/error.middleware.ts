import type { Request, Response, NextFunction } from 'express';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  console.error(err);
  if (err instanceof Error) {
    const known: Record<string, number> = {
      INVALID_CODE: 404,
      CODE_EXPIRED: 410,
      COUPLE_FULL: 409,
      ALREADY_MEMBER: 409,
      INSUFFICIENT_LIQUID: 400,
      INSUFFICIENT_SAVINGS: 400,
      NOT_FOUND: 404,
      COUPLE_NOT_FOUND: 404,
      NOT_MEMBER: 403,
      CATEGORY_REQUIRED: 400,
      INVALID_AMOUNT: 400,
    };
    const status = known[err.message] ?? 500;
    if (status < 500) {
      res.status(status).json({ error: err.message });
      return;
    }
  }
  res.status(500).json({ error: 'Internal server error' });
}
