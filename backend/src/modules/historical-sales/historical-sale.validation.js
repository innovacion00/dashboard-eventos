import { z } from 'zod';

export const createHistoricalSaleSchema = z.object({
  body: z.object({
    year: z.number().int().min(2020).max(2030),
    month: z.number().int().min(1).max(12),
    executiveId: z.string().min(1, 'El ejecutivo es obligatorio'),
    confirmedSales: z.number().nonnegative('El valor no puede ser negativo'),
    confirmedEvents: z.number().int().nonnegative().optional().default(0),
    notes: z.string().optional(),
  }),
});

export const updateHistoricalSaleSchema = z.object({
  body: z.object({
    confirmedSales: z.number().nonnegative().optional(),
    confirmedEvents: z.number().int().nonnegative().optional(),
    notes: z.string().optional(),
  }),
});
