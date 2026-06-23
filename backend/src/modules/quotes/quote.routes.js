import { Router } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware.js';
import { requireRole } from '../../core/middlewares/authorize.middleware.js';
import { validate } from '../../core/middlewares/validate.middleware.js';
import { quoteController } from './quote.controller.js';
import { createQuoteSchema, updateQuoteSchema, changeQuoteStatusSchema } from './quote.validation.js';
import { ROLES } from '../../core/constants/roles.js';

const { DIRECCION_GENERAL, LIDER_COMERCIAL, ADMINISTRADOR } = ROLES;

const router = Router();

router.use(authMiddleware);

router.get('/', quoteController.list);
router.post('/', validate(createQuoteSchema), quoteController.create);
router.get('/:id', quoteController.getById);
router.get('/:id/pdf', quoteController.downloadPdf);
router.patch('/:id', validate(updateQuoteSchema), quoteController.update);
router.patch('/:id/status', validate(changeQuoteStatusSchema), quoteController.changeStatus);
router.delete('/:id', requireRole([DIRECCION_GENERAL, LIDER_COMERCIAL, ADMINISTRADOR]), quoteController.remove);

export { router as quoteRouter };
