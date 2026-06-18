import { Router } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware.js';
import { validate } from '../../core/middlewares/validate.middleware.js';
import { activityController } from './activity.controller.js';
import { createActivitySchema } from './activity.validation.js';
import { activityUpload } from '../../core/middlewares/upload.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', activityController.list);
router.post(
  '/',
  activityUpload.array('attachments', 10),
  validate(createActivitySchema),
  activityController.create
);

export { router as activityRouter };
