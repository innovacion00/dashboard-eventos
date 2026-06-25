import { Router } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware.js';
import { planningController } from './planning.controller.js';

const router = Router();

router.use(authMiddleware);
router.get('/', planningController.getOccupations);

export { router as planningRouter };
