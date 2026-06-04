import { Router } from 'express';
import { requireAuth, requireCouple } from '../../middleware/auth.middleware.js';
import { getDashboard } from '../../services/dashboard.service.js';

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth, requireCouple);

dashboardRouter.get('/', async (req, res, next) => {
  try {
    const dashboard = await getDashboard(req.auth!.coupleId!);
    res.json(dashboard);
  } catch (e) {
    next(e);
  }
});
