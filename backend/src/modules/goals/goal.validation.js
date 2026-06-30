import { z } from 'zod';

export const createGoalSchema = z.object({
  body: z.object({
    year: z.number().int().min(2020).max(2100),
    month: z.number().int().min(1).max(12),
    userId: z.string().min(1).optional(),
    revenueTarget: z.number().nonnegative('La meta de ingresos es obligatoria'),
    eventCountTarget: z.number().int().nonnegative().optional(),
    averageTicketTarget: z.number().nonnegative().optional(),
    marginTarget: z.number().min(0).max(100).optional(),
    presaleThreshold: z.number().min(0).max(100).default(60),
  }),
});

export const updateGoalSchema = z.object({
  body: z.object({
    revenueTarget: z.number().nonnegative().optional(),
    eventCountTarget: z.number().int().nonnegative().optional(),
    averageTicketTarget: z.number().nonnegative().optional(),
    marginTarget: z.number().min(0).max(100).optional(),
    presaleThreshold: z.number().min(0).max(100).optional(),
  }),
});
