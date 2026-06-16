import { z } from 'zod';

const COMPANY_STATUSES = ['PROSPECTO', 'CLIENTE_ACTIVO', 'CLIENTE_INACTIVO', 'ALIADO', 'AGENCIA', 'GUBERNAMENTAL'];

const locationSchema = z.object({
  country: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
}).optional();

export const createCompanySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    taxId: z.string().optional(),
    segment: z.string().min(1, 'El segmento es obligatorio'),
    status: z.enum(COMPANY_STATUSES).optional(),
    origin: z.string().optional(),
    estimatedPotential: z.number().nonnegative().optional(),
    location: locationSchema,
    nextActionAt: z.string().datetime().optional(),
    nextActionDescription: z.string().optional(),
  }),
});

export const updateCompanySchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    taxId: z.string().optional(),
    segment: z.string().optional(),
    status: z.enum(COMPANY_STATUSES).optional(),
    origin: z.string().optional(),
    estimatedPotential: z.number().nonnegative().optional(),
    location: locationSchema,
    nextActionAt: z.string().datetime().optional().nullable(),
    nextActionDescription: z.string().optional(),
    lastContactAt: z.string().datetime().optional().nullable(),
  }),
});

const importRowSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  taxId: z.string().optional(),
  segment: z.string().min(1, 'El segmento es obligatorio'),
  status: z.enum(COMPANY_STATUSES).optional(),
  origin: z.string().optional(),
  estimatedPotential: z.number().nonnegative().optional(),
  location: locationSchema,
});

export const importCompaniesSchema = z.object({
  body: z.object({
    companies: z
      .array(importRowSchema)
      .min(1, 'Debe incluir al menos una empresa')
      .max(500, 'Máximo 500 empresas por importación'),
  }),
});
