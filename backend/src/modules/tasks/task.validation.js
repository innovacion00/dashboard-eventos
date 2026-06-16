import { z } from 'zod';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'El título debe tener al menos 2 caracteres'),
    description: z.string().optional(),
    type: z.string().optional(),
    priority: z.enum(['ALTA', 'MEDIA', 'BAJA']).default('MEDIA'),
    dueDate: z.string().datetime().optional(),
    assigneeId: z.string().optional(),
    relatedEntity: z.object({
      kind: z.enum(['company', 'opportunity', 'event']),
      id: z.string(),
    }).optional(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    description: z.string().optional(),
    priority: z.enum(['ALTA', 'MEDIA', 'BAJA']).optional(),
    dueDate: z.string().datetime().optional().nullable(),
    assigneeId: z.string().optional(),
  }),
});

export const changeTaskStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA', 'VENCIDA']),
  }),
});
