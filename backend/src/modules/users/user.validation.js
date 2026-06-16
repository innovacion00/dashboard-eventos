import { z } from 'zod';
import { ROLES } from '../../core/constants/roles.js';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Correo electrónico inválido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    role: z.enum(Object.values(ROLES), { errorMap: () => ({ message: 'Rol inválido' }) }),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    role: z.enum(Object.values(ROLES)).optional(),
    status: z.enum(['ACTIVO', 'INACTIVO', 'SUSPENDIDO']).optional(),
  }),
});
