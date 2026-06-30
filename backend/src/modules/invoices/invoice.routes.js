import { Router } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware.js';
import { requireRole } from '../../core/middlewares/authorize.middleware.js';
import { validate } from '../../core/middlewares/validate.middleware.js';
import { invoiceController } from './invoice.controller.js';
import { invoicePaymentUpload } from './invoice-upload.middleware.js';
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  changeInvoiceStatusSchema,
} from './invoice.validation.js';

const FINANCE_ROLES = ['FINANCIERO_CARTERA', 'DIRECCION_GENERAL', 'ADMINISTRADOR'];

export const invoiceRouter = Router();

invoiceRouter.use(authMiddleware);

invoiceRouter.get('/', invoiceController.list);
invoiceRouter.post('/', requireRole(FINANCE_ROLES), validate(createInvoiceSchema), invoiceController.create);
invoiceRouter.get('/:id', invoiceController.getById);
invoiceRouter.patch('/:id', requireRole(FINANCE_ROLES), validate(updateInvoiceSchema), invoiceController.update);
invoiceRouter.patch('/:id/status', requireRole(FINANCE_ROLES), validate(changeInvoiceStatusSchema), invoiceController.changeStatus);
invoiceRouter.post('/:id/payments', requireRole(FINANCE_ROLES), invoicePaymentUpload.single('file'), invoiceController.addPayment);
invoiceRouter.delete('/:id/payments/:paymentId', requireRole(FINANCE_ROLES), invoiceController.cancelPayment);
invoiceRouter.delete('/:id', requireRole(FINANCE_ROLES), invoiceController.remove);
