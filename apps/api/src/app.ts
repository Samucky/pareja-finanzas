import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { env } from './config/env.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { couplesRouter } from './modules/couples/couples.routes.js';
import { transactionsRouter } from './modules/transactions/transactions.routes.js';
import { savingsRouter } from './modules/savings/savings.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
      credentials: true,
    })
  );
  app.use(compression());
  app.use(morgan('dev'));
  app.use(express.json({ limit: '100kb' }));

  app.get('/', (_req, res) => {
    res.json({
      name: 'Pareja Finanzas API',
      status: 'running',
      health: '/health',
      docs: {
        auth: '/api/auth',
        dashboard: '/api/dashboard',
        transactions: '/api/transactions',
        savings: '/api/savings',
        couples: '/api/couples',
      },
    });
  });

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.use('/api/auth', authRouter);
  app.use('/api/couples', couplesRouter);
  app.use('/api/transactions', transactionsRouter);
  app.use('/api/savings', savingsRouter);
  app.use('/api/dashboard', dashboardRouter);

  app.use(errorHandler);

  return app;
}
