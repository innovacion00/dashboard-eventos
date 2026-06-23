import { z } from 'zod';
import { QUESTION_TYPES, SURVEY_STATUSES } from './survey.model.js';

const questionSchema = z.object({
  order: z.number().int().nonnegative('El orden debe ser un número no negativo'),
  type: z.enum(QUESTION_TYPES, { errorMap: () => ({ message: 'Tipo de pregunta inválido' }) }),
  text: z.string().min(1, 'El texto de la pregunta es obligatorio'),
  required: z.boolean().default(true),
  options: z.array(z.string()).optional(),
});

export const createSurveySchema = z.object({
  body: z.object({
    eventId: z.string().min(1, 'El evento es obligatorio'),
    title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
    description: z.string().optional(),
    questions: z.array(questionSchema).min(1, 'Debe incluir al menos una pregunta'),
  }),
});

export const updateSurveySchema = z.object({
  body: z.object({
    title: z.string().min(3, 'El título debe tener al menos 3 caracteres').optional(),
    description: z.string().optional(),
    questions: z.array(questionSchema).min(1, 'Debe incluir al menos una pregunta').optional(),
  }),
});

export const changeSurveyStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACTIVA', 'CERRADA'], { errorMap: () => ({ message: 'Estado inválido' }) }),
  }),
});

export const submitResponseSchema = z.object({
  body: z.object({
    respondentName: z.string().optional(),
    respondentEmail: z.string().email('Correo electrónico inválido').optional().or(z.literal('')),
    answers: z
      .array(
        z.object({
          questionId: z.string().min(1, 'El ID de la pregunta es obligatorio'),
          value: z.union([z.string(), z.number(), z.array(z.string())]),
        })
      )
      .min(1, 'Debe incluir al menos una respuesta'),
  }),
});
