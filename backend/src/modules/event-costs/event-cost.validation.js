import { z } from 'zod';
import { COST_CATEGORIES } from './event-cost.model.js';

export const createEventCostSchema = z.object({
  body: z.object({
    eventId: z.string().min(1, 'El evento es obligatorio'),
    category: z.enum(COST_CATEGORIES, { required_error: 'La categoría es obligatoria' }),
    description: z.string().min(2, 'La descripción es obligatoria'),
    estimatedAmount: z.number().min(0).optional(),
    actualAmount: z.number().min(0).optional(),
    vendor: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const updateEventCostSchema = z.object({
  body: z.object({
    category: z.enum(COST_CATEGORIES).optional(),
    description: z.string().min(2).optional(),
    estimatedAmount: z.number().min(0).optional(),
    actualAmount: z.number().min(0).optional(),
    vendor: z.string().optional(),
    notes: z.string().optional(),
  }),
});
