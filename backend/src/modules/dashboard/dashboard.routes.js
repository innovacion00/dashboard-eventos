import { Router } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware.js';
import { dashboardController } from './dashboard.controller.js';

const router = Router();

router.use(authMiddleware);
router.get('/snapshot', dashboardController.snapshot);

export { router as dashboardRouter };
