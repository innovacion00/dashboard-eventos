import { Router } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware.js';
import { requireRole } from '../../core/middlewares/authorize.middleware.js';
import { validate } from '../../core/middlewares/validate.middleware.js';
import { vendorController } from './vendor.controller.js';
import { createVendorSchema, updateVendorSchema } from './vendor.validation.js';
import { ROLES } from '../../core/constants/roles.js';

const { ADMINISTRADOR, DIRECCION_GENERAL, LIDER_COMERCIAL, COORDINACION_OPERATIVA } = ROLES;

const router = Router();

router.use(authMiddleware);

router.get('/', vendorController.list);
router.get('/:id', vendorController.getById);
router.post('/', requireRole([ADMINISTRADOR, DIRECCION_GENERAL, LIDER_COMERCIAL, COORDINACION_OPERATIVA]), validate(createVendorSchema), vendorController.create);
router.patch('/:id', requireRole([ADMINISTRADOR, DIRECCION_GENERAL, LIDER_COMERCIAL, COORDINACION_OPERATIVA]), validate(updateVendorSchema), vendorController.update);
router.delete('/:id', requireRole([ADMINISTRADOR, DIRECCION_GENERAL]), vendorController.remove);

export { router as vendorRouter };
