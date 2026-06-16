import { z } from 'zod';

const BEO_STATUSES = ['BORRADOR', 'EMITIDO', 'CONFIRMADO'];

const menuItemSchema = z.object({
  time: z.string().optional(),
  description: z.string().min(1),
  serviceId: z.string().optional(),
  quantity: z.number().positive().optional(),
  notes: z.string().optional(),
});

const avItemSchema = z.object({
  description: z.string().min(1),
  serviceId: z.string().optional(),
  quantity: z.number().positive().optional(),
  notes: z.string().optional(),
});

const personnelSchema = z.object({
  role: z.string().min(1),
  quantity: z.number().positive().optional(),
  notes: z.string().optional(),
});

const supplierSchema = z.object({
  name: z.string().min(1),
  service: z.string().optional(),
  contact: z.string().optional(),
  notes: z.string().optional(),
});

const setupSchema = z.object({
  type: z.string().optional(),
  chairs: z.number().nonnegative().optional(),
  tables: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  readyAt: z.string().datetime().optional(),
}).optional();

export const createBeoSchema = z.object({
  body: z.object({
    eventId: z.string().min(1, 'El evento es obligatorio'),
    setup: setupSchema,
    menu: z.array(menuItemSchema).default([]),
    audiovisual: z.array(avItemSchema).default([]),
    personnel: z.array(personnelSchema).default([]),
    suppliers: z.array(supplierSchema).default([]),
    generalNotes: z.string().optional(),
  }),
});

export const updateBeoSchema = z.object({
  body: z.object({
    setup: setupSchema,
    menu: z.array(menuItemSchema).optional(),
    audiovisual: z.array(avItemSchema).optional(),
    personnel: z.array(personnelSchema).optional(),
    suppliers: z.array(supplierSchema).optional(),
    generalNotes: z.string().optional(),
  }),
});

export const changeBeoStatusSchema = z.object({
  body: z.object({
    status: z.enum(BEO_STATUSES, { errorMap: () => ({ message: 'Estado inválido' }) }),
  }),
});
