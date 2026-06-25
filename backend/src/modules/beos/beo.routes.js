import { Router } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware.js';
import { validate } from '../../core/middlewares/validate.middleware.js';
import { beoController } from './beo.controller.js';
import { createBeoSchema, updateBeoSchema, changeBeoStatusSchema } from './beo.validation.js';
import { beoPaymentUpload } from './beo-upload.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/event/:eventId', beoController.getByEvent);
router.post('/', validate(createBeoSchema), beoController.create);
router.patch('/:id', validate(updateBeoSchema), beoController.update);
router.patch('/:id/status', validate(changeBeoStatusSchema), beoController.changeStatus);
router.get('/:id/pdf', beoController.downloadPdf);
router.post('/:id/payments', beoPaymentUpload.single('file'), beoController.addPayment);
router.delete('/:id/payments/:paymentId', beoController.removePayment);

export { router as beoRouter };
