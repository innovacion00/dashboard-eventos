import { Router } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware.js';
import { requireRole } from '../../core/middlewares/authorize.middleware.js';
import { validate } from '../../core/middlewares/validate.middleware.js';
import { serviceController } from './service.controller.js';
import { createServiceSchema, updateServiceSchema } from './service.validation.js';
import { ROLES } from '../../core/constants/roles.js';

const { ADMINISTRADOR, DIRECCION_GENERAL, LIDER_COMERCIAL } = ROLES;

const router = Router();

router.use(authMiddleware);

router.get('/', serviceController.list);
router.get('/:id', serviceController.getById);
router.post('/', requireRole([ADMINISTRADOR, DIRECCION_GENERAL, LIDER_COMERCIAL]), validate(createServiceSchema), serviceController.create);
router.patch('/:id', requireRole([ADMINISTRADOR, DIRECCION_GENERAL, LIDER_COMERCIAL]), validate(updateServiceSchema), serviceController.update);
router.delete('/:id', requireRole([ADMINISTRADOR, DIRECCION_GENERAL]), serviceController.remove);

export { router as serviceRouter };
