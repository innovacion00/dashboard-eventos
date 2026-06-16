import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('El correo electrónico no es válido'),
    password: z.string().min(1, 'La contraseña es requerida'),
  }),
});
