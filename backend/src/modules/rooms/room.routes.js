import { Router } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware.js';
import { requireRole } from '../../core/middlewares/authorize.middleware.js';
import { roomController } from './room.controller.js';
import { ROLES } from '../../core/constants/roles.js';

const MANAGERS = [
  ROLES.ADMINISTRADOR,
  ROLES.DIRECCION_GENERAL,
  ROLES.GERENCIA_HOTEL,
  ROLES.LIDER_COMERCIAL,
];

const router = Router();

router.use(authMiddleware);

router.get('/', roomController.list);
router.patch('/:id', requireRole(MANAGERS), roomController.update);

export { router as roomRouter };
