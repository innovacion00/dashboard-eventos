import { Router } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware.js';
import { requireRole } from '../../core/middlewares/authorize.middleware.js';
import { validate } from '../../core/middlewares/validate.middleware.js';
import { userController } from './user.controller.js';
import { createUserSchema, updateUserSchema } from './user.validation.js';
import { ROLES } from '../../core/constants/roles.js';

const { DIRECCION_GENERAL, GERENCIA_HOTEL, ADMINISTRADOR } = ROLES;

const router = Router();

router.use(authMiddleware);

router.get('/', requireRole([DIRECCION_GENERAL, GERENCIA_HOTEL, ADMINISTRADOR]), userController.list);
router.post('/', requireRole([DIRECCION_GENERAL, ADMINISTRADOR]), validate(createUserSchema), userController.create);
router.get('/:id', requireRole([DIRECCION_GENERAL, GERENCIA_HOTEL, ADMINISTRADOR]), userController.getById);
router.patch('/:id', requireRole([DIRECCION_GENERAL, ADMINISTRADOR]), validate(updateUserSchema), userController.update);

export { router as userRouter };
