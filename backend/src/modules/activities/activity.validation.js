import { z } from 'zod';

const optionalDatetime = z.preprocess(
  (v) => (v === '' || v === null ? undefined : v),
  z.string().datetime().optional()
);

export const createActivitySchema = z.object({
  body: z.object({
    companyId: z.string().min(1, 'La empresa es obligatoria'),
    contactId: z.string().optional(),
    opportunityId: z.string().optional(),
    type: z.string().min(1, 'El tipo de actividad es obligatorio'),
    date: optionalDatetime,
    result: z.string().min(1, 'El resultado es obligatorio'),
    nextActionDescription: z.string().optional(),
    nextActionAt: optionalDatetime,
  }),
});
