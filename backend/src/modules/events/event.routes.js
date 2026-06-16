import { Router } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware.js';
import { requireRole } from '../../core/middlewares/authorize.middleware.js';
import { validate } from '../../core/middlewares/validate.middleware.js';
import { eventController } from './event.controller.js';
import { createEventSchema, updateEventSchema, changeEventStatusSchema } from './event.validation.js';
import { ROLES } from '../../core/constants/roles.js';

const { DIRECCION_GENERAL, LIDER_COMERCIAL, ADMINISTRADOR } = ROLES;

const router = Router();

router.use(authMiddleware);

router.get('/', eventController.list);
router.post('/', validate(createEventSchema), eventController.create);
router.get('/:id', eventController.getById);
router.patch('/:id', validate(updateEventSchema), eventController.update);
router.patch('/:id/status', validate(changeEventStatusSchema), eventController.changeStatus);
router.delete('/:id', requireRole([DIRECCION_GENERAL, LIDER_COMERCIAL, ADMINISTRADOR]), eventController.remove);

export { router as eventRouter };
