import { Router } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware.js';
import { requireRole } from '../../core/middlewares/authorize.middleware.js';
import { validate } from '../../core/middlewares/validate.middleware.js';
import { historicalSaleController } from './historical-sale.controller.js';
import { createHistoricalSaleSchema, updateHistoricalSaleSchema } from './historical-sale.validation.js';
import { ROLES } from '../../core/constants/roles.js';

const MANAGE = [ROLES.DIRECCION_GENERAL, ROLES.LIDER_COMERCIAL, ROLES.ADMINISTRADOR];

const router = Router();

router.use(authMiddleware);

router.get('/', historicalSaleController.list);
router.get('/summary/:year', historicalSaleController.summary);
router.post('/', requireRole(MANAGE), validate(createHistoricalSaleSchema), historicalSaleController.create);
router.patch('/:id', requireRole(MANAGE), validate(updateHistoricalSaleSchema), historicalSaleController.update);
router.delete('/:id', requireRole(MANAGE), historicalSaleController.remove);

export { router as historicalSaleRouter };
