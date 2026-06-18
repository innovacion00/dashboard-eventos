import { z } from 'zod';

const COMPANY_STATUSES = ['PROSPECTO', 'CLIENTE_ACTIVO', 'CLIENTE_INACTIVO', 'ALIADO', 'AGENCIA', 'GUBERNAMENTAL'];

export const createCompanySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    segment: z.string().min(1, 'El segmento es obligatorio'),
    status: z.enum(COMPANY_STATUSES).optional(),
    contactName: z.string().optional(),
    contactPosition: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Correo inválido').optional().or(z.literal('')),
    address: z.string().optional(),
  }),
});

export const updateCompanySchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    segment: z.string().optional(),
    status: z.enum(COMPANY_STATUSES).optional(),
    contactName: z.string().optional(),
    contactPosition: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Correo inválido').optional().or(z.literal('')),
    address: z.string().optional(),
    nextActionAt: z.string().datetime().optional().nullable(),
    nextActionDescription: z.string().optional(),
    lastContactAt: z.string().datetime().optional().nullable(),
  }),
});

const importRowSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  segment: z.string().min(1, 'El segmento es obligatorio'),
  status: z.enum(COMPANY_STATUSES).optional(),
  contactName: z.string().optional(),
  contactPosition: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
});

export const importCompaniesSchema = z.object({
  body: z.object({
    companies: z
      .array(importRowSchema)
      .min(1, 'Debe incluir al menos una empresa')
      .max(5000, 'Máximo 5000 empresas por importación'),
  }),
});
