import { Router } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware.js';
import { requireRole } from '../../core/middlewares/authorize.middleware.js';
import { validate } from '../../core/middlewares/validate.middleware.js';
import { goalController } from './goal.controller.js';
import { createGoalSchema, updateGoalSchema } from './goal.validation.js';
import { ROLES } from '../../core/constants/roles.js';

const { DIRECCION_GENERAL, LIDER_COMERCIAL, ADMINISTRADOR } = ROLES;
const GOAL_ROLES = [DIRECCION_GENERAL, LIDER_COMERCIAL, ADMINISTRADOR];

const router = Router();

router.use(authMiddleware);

router.get('/', goalController.get);
router.post('/', requireRole(GOAL_ROLES), validate(createGoalSchema), goalController.create);
router.patch('/:id', requireRole(GOAL_ROLES), validate(updateGoalSchema), goalController.update);
router.delete('/:id', requireRole(GOAL_ROLES), goalController.remove);

export { router as goalRouter };
