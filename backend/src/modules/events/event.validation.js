import { z } from 'zod';

const EVENT_STATUSES = ['CONFIRMADO', 'EN_PRODUCCION', 'REALIZADO', 'CANCELADO', 'POSPUESTO'];
const SETUP_TYPES = ['AUDITORIO', 'ESCUELA', 'U_SHAPE', 'COCTEL', 'BANQUETE'];

export const createEventSchema = z.object({
  body: z.object({
    opportunityId: z.string().optional(),
    quoteId: z.string().optional(),
    companyId: z.string().min(1, 'La empresa es obligatoria'),
    contactId: z.string().optional(),
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    eventType: z.string().optional(),
    roomId: z.string().optional(),
    eventDate: z.string().datetime({ message: 'Fecha inválida' }),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM').optional(),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM').optional(),
    attendees: z.number().positive().optional(),
    setupType: z.enum(SETUP_TYPES).optional(),
    totalValue: z.number().nonnegative().optional(),
    notes: z.string().optional(),
  }),
});

export const updateEventSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    eventType: z.string().optional(),
    roomId: z.string().optional(),
    eventDate: z.string().datetime().optional(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    attendees: z.number().positive().optional(),
    setupType: z.enum(SETUP_TYPES).optional(),
    totalValue: z.number().nonnegative().optional(),
    notes: z.string().optional(),
    quoteId: z.string().optional(),
    contactId: z.string().optional(),
  }),
});

export const changeEventStatusSchema = z.object({
  body: z.object({
    status: z.enum(EVENT_STATUSES, { errorMap: () => ({ message: 'Estado inválido' }) }),
  }),
});
