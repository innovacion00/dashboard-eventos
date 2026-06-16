import { Router } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware.js';
import { requireRole } from '../../core/middlewares/authorize.middleware.js';
import { validate } from '../../core/middlewares/validate.middleware.js';
import { commissionController } from './commission.controller.js';
import {
  createCommissionSchema,
  updateCommissionSchema,
  changeCommissionStatusSchema,
} from './commission.validation.js';

const FINANCE_ROLES = ['FINANCIERO_CARTERA', 'DIRECCION_GENERAL', 'ADMINISTRADOR'];
const APPROVE_ROLES = ['DIRECCION_GENERAL', 'LIDER_COMERCIAL', 'ADMINISTRADOR'];

export const commissionRouter = Router();

commissionRouter.use(authMiddleware);

commissionRouter.get('/', commissionController.list);
commissionRouter.post('/', requireRole(FINANCE_ROLES), validate(createCommissionSchema), commissionController.create);
commissionRouter.get('/:id', commissionController.getById);
commissionRouter.patch('/:id', requireRole(FINANCE_ROLES), validate(updateCommissionSchema), commissionController.update);
commissionRouter.patch('/:id/status', requireRole(APPROVE_ROLES), validate(changeCommissionStatusSchema), commissionController.changeStatus);
commissionRouter.delete('/:id', requireRole(FINANCE_ROLES), commissionController.remove);
