import { z } from 'zod';

export const createActivitySchema = z.object({
  body: z.object({
    companyId: z.string().min(1, 'La empresa es obligatoria'),
    contactId: z.string().optional(),
    opportunityId: z.string().optional(),
    type: z.string().min(1, 'El tipo de actividad es obligatorio'),
    date: z.string().datetime().optional(),
    result: z.string().min(1, 'El resultado es obligatorio'),
    nextActionDescription: z.string().optional(),
    nextActionAt: z.string().datetime().optional(),
  }),
});
