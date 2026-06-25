import { z } from 'zod';
import { STAGE_CODES } from '../../core/constants/stages.js';

export const createOpportunitySchema = z.object({
  body: z.object({
    name: z.string().optional(),
    companyId: z.string().min(1, 'La empresa es obligatoria'),
    eventType: z.string().optional(),
    segment: z.string().optional(),
    probableRoomId: z.string().optional(),
    estimatedEventDate: z.string().datetime().optional(),
    projectionMonth: z.string().regex(/^\d{4}-\d{2}$/, 'Formato YYYY-MM requerido').optional(),
    attendees: z.number().int().nonnegative().optional(),
    estimatedValue: z.number().nonnegative().optional().default(0),
    stage: z.enum(STAGE_CODES).optional(),
    nextActionAt: z.string().datetime().optional(),
    nextActionDescription: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const updateOpportunitySchema = z.object({
  body: z.object({
    name: z.string().optional(),
    eventType: z.string().optional(),
    segment: z.string().optional(),
    probableRoomId: z.string().optional().nullable(),
    estimatedEventDate: z.string().datetime().optional().nullable(),
    projectionMonth: z.string().regex(/^\d{4}-\d{2}$/).optional(),
    attendees: z.number().int().nonnegative().optional(),
    estimatedValue: z.number().nonnegative().optional(),
    nextActionAt: z.string().datetime().optional().nullable(),
    nextActionDescription: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const changeStageSchema = z.object({
  body: z.object({
    stage: z.enum(STAGE_CODES, { errorMap: () => ({ message: 'Etapa inválida' }) }),
  }),
});
