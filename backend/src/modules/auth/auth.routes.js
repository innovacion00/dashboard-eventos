import { Router } from 'express';
import { validate } from '../../core/middlewares/validate.middleware.js';
import { authMiddleware } from '../../core/middlewares/auth.middleware.js';
import { loginSchema } from './auth.validation.js';
import { loginController, logoutController, getMeController } from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/login', validate(loginSchema), loginController);
authRouter.post('/logout', authMiddleware, logoutController);
authRouter.get('/me', authMiddleware, getMeController);
