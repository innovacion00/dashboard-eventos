import { z } from 'zod';
import { VENDOR_CATEGORIES } from './vendor.model.js';

export const createVendorSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    category: z.enum(VENDOR_CATEGORIES, { errorMap: () => ({ message: 'Categoría inválida' }) }),
    contactName: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Correo inválido').optional().or(z.literal('')),
    nit: z.string().optional(),
    address: z.string().optional(),
    services: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const updateVendorSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    category: z.enum(VENDOR_CATEGORIES).optional(),
    contactName: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Correo inválido').optional().or(z.literal('')),
    nit: z.string().optional(),
    address: z.string().optional(),
    services: z.string().optional(),
    notes: z.string().optional(),
  }),
});
