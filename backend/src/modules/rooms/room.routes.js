import { Router } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware.js';
import { roomController } from './room.controller.js';

const router = Router();

router.use(authMiddleware);
router.get('/', roomController.list);

export { router as roomRouter };
