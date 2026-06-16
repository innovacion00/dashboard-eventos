import { z } from 'zod';
import { INVOICE_STATUSES, PAYMENT_METHODS, PAYMENT_TYPES } from './invoice.model.js';

export const createInvoiceSchema = z.object({
  body: z.object({
    eventId: z.string().min(1, 'El evento es obligatorio'),
    companyId: z.string().min(1, 'La empresa es obligatoria'),
    quoteId: z.string().optional(),
    subtotal: z.number({ required_error: 'El subtotal es obligatorio' }).min(0),
    taxRate: z.number().min(0).max(1).optional(),
    issueDate: z.string().optional(),
    dueDate: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const updateInvoiceSchema = z.object({
  body: z.object({
    subtotal: z.number().min(0).optional(),
    taxRate: z.number().min(0).max(1).optional(),
    issueDate: z.string().optional(),
    dueDate: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const changeInvoiceStatusSchema = z.object({
  body: z.object({
    status: z.enum(INVOICE_STATUSES, { required_error: 'El estado es obligatorio' }),
  }),
});

export const addPaymentSchema = z.object({
  body: z.object({
    type: z.enum(PAYMENT_TYPES, { required_error: 'El tipo de pago es obligatorio' }),
    amount: z.number({ required_error: 'El monto es obligatorio' }).positive('El monto debe ser positivo'),
    paymentDate: z.string({ required_error: 'La fecha de pago es obligatoria' }),
    method: z.enum(PAYMENT_METHODS, { required_error: 'El método de pago es obligatorio' }),
    reference: z.string().optional(),
    notes: z.string().optional(),
  }),
});
