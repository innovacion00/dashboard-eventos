import { z } from 'zod';

const SERVICE_CATEGORIES = ['SALON', 'AB', 'AV', 'OTROS', 'EXTERNO'];

export const createServiceSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    description: z.string().optional(),
    category: z.enum(SERVICE_CATEGORIES, { errorMap: () => ({ message: 'Categoría inválida' }) }),
    unitPrice: z.number().nonnegative('El precio no puede ser negativo'),
    unit: z.string().optional(),
  }),
});

export const updateServiceSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    category: z.enum(SERVICE_CATEGORIES).optional(),
    unitPrice: z.number().nonnegative().optional(),
    unit: z.string().optional(),
  }),
});
