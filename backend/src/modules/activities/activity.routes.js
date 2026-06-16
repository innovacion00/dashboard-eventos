import { Router } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware.js';
import { validate } from '../../core/middlewares/validate.middleware.js';
import { activityController } from './activity.controller.js';
import { createActivitySchema } from './activity.validation.js';

const router = Router();

router.use(authMiddleware);

router.get('/', activityController.list);
router.post('/', validate(createActivitySchema), activityController.create);

export { router as activityRouter };
