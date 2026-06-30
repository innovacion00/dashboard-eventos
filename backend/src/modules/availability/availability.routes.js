import { Router } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware.js';
import { availabilityController } from './availability.controller.js';

export const availabilityRouter = Router();

availabilityRouter.use(authMiddleware);

availabilityRouter.get('/', availabilityController.check);
