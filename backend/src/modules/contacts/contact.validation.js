import { z } from 'zod';

export const createContactSchema = z.object({
  body: z.object({
    companyId: z.string().min(1, 'La empresa es obligatoria'),
    fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    position: z.string().optional(),
    email: z.string().email('Correo inválido').optional(),
    phone: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const updateContactSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    position: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    notes: z.string().optional(),
  }),
});
