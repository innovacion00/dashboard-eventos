import { z } from 'zod';
import { COMMISSION_STATUSES, BENEFICIARY_TYPES } from './commission.model.js';

export const createCommissionSchema = z.object({
  body: z.object({
    eventId: z.string().min(1, 'El evento es obligatorio'),
    invoiceId: z.string().optional(),
    beneficiaryId: z.string().optional(),
    beneficiaryName: z.string().optional(),
    beneficiaryType: z.enum(BENEFICIARY_TYPES, { required_error: 'El tipo de beneficiario es obligatorio' }),
    baseAmount: z.number({ required_error: 'El monto base es obligatorio' }).min(0),
    rate: z.number({ required_error: 'La tasa es obligatoria' }).min(0).max(1),
    notes: z.string().optional(),
  }),
});

export const updateCommissionSchema = z.object({
  body: z.object({
    beneficiaryId: z.string().optional(),
    beneficiaryName: z.string().optional(),
    beneficiaryType: z.enum(BENEFICIARY_TYPES).optional(),
    baseAmount: z.number().min(0).optional(),
    rate: z.number().min(0).max(1).optional(),
    notes: z.string().optional(),
  }),
});

export const changeCommissionStatusSchema = z.object({
  body: z.object({
    status: z.enum(COMMISSION_STATUSES, { required_error: 'El estado es obligatorio' }),
  }),
});
