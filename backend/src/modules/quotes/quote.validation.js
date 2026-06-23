import { z } from 'zod';

const ITEM_CATEGORIES = ['SALON', 'AB', 'AV', 'OTROS', 'EXTERNO'];
const QUOTE_STATUSES = ['BORRADOR', 'EN_REVISION', 'APROBADA', 'RECHAZADA', 'VENCIDA'];

const lineItemSchema = z.object({
  description: z.string().min(1, 'La descripción es obligatoria'),
  serviceId: z.string().optional(),
  quantity: z.number().positive('La cantidad debe ser mayor a 0'),
  unitPrice: z.number().nonnegative('El precio no puede ser negativo'),
  category: z.enum(ITEM_CATEGORIES).optional(),
});

export const createQuoteSchema = z.object({
  body: z.object({
    opportunityId: z.string().min(1, 'La oportunidad es obligatoria'),
    companyId: z.string().min(1, 'La empresa es obligatoria'),
    validUntil: z.string().datetime().optional(),
    eventDate: z.string().datetime().optional(),
    eventType: z.string().optional(),
    roomId: z.string().optional(),
    attendees: z.number().positive().optional(),
    items: z.array(lineItemSchema).default([]),
    taxRate: z.number().min(0).max(1).optional(),
    notes: z.string().optional(),
    internalNotes: z.string().optional(),
  }),
});

export const updateQuoteSchema = z.object({
  body: z.object({
    validUntil: z.string().datetime().optional(),
    eventDate: z.string().datetime().optional(),
    eventType: z.string().optional(),
    roomId: z.string().optional(),
    attendees: z.number().positive().optional(),
    items: z.array(lineItemSchema).optional(),
    taxRate: z.number().min(0).max(1).optional(),
    notes: z.string().optional(),
    internalNotes: z.string().optional(),
  }),
});

export const changeQuoteStatusSchema = z.object({
  body: z.object({
    status: z.enum(QUOTE_STATUSES, { errorMap: () => ({ message: 'Estado inválido' }) }),
  }),
});
