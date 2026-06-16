import { Router } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware.js';
import { requireRole } from '../../core/middlewares/authorize.middleware.js';
import { validate } from '../../core/middlewares/validate.middleware.js';
import { eventCostController } from './event-cost.controller.js';
import { createEventCostSchema, updateEventCostSchema } from './event-cost.validation.js';

const WRITE_ROLES = ['FINANCIERO_CARTERA', 'COORDINACION_OPERATIVA', 'DIRECCION_GENERAL', 'ADMINISTRADOR'];

export const eventCostRouter = Router();

eventCostRouter.use(authMiddleware);

eventCostRouter.get('/event/:eventId', eventCostController.listByEvent);
eventCostRouter.get('/event/:eventId/summary', eventCostController.getSummary);
eventCostRouter.post('/', requireRole(WRITE_ROLES), validate(createEventCostSchema), eventCostController.create);
eventCostRouter.patch('/:id', requireRole(WRITE_ROLES), validate(updateEventCostSchema), eventCostController.update);
eventCostRouter.delete('/:id', requireRole(WRITE_ROLES), eventCostController.remove);
