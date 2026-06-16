import { Router } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware.js';
import { validate } from '../../core/middlewares/validate.middleware.js';
import { contactController } from './contact.controller.js';
import { createContactSchema, updateContactSchema } from './contact.validation.js';

const router = Router();

router.use(authMiddleware);

router.post('/', validate(createContactSchema), contactController.create);
router.patch('/:id', validate(updateContactSchema), contactController.update);
router.delete('/:id', contactController.remove);

export { router as contactRouter };
