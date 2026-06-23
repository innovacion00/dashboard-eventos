import { Router } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware.js';
import { requireRole } from '../../core/middlewares/authorize.middleware.js';
import { validate } from '../../core/middlewares/validate.middleware.js';
import { surveyController } from './survey.controller.js';
import {
  createSurveySchema,
  updateSurveySchema,
  changeSurveyStatusSchema,
  submitResponseSchema,
} from './survey.validation.js';
import { ROLES } from '../../core/constants/roles.js';

const { CALIDAD, DIRECCION_GENERAL, ADMINISTRADOR, GERENCIA_HOTEL } = ROLES;
const MANAGE = [CALIDAD, DIRECCION_GENERAL, ADMINISTRADOR];

const router = Router();

// Public routes (no auth)
router.get('/public/:token', surveyController.getPublicSurvey);
router.post('/public/:token', validate(submitResponseSchema), surveyController.submitPublicResponse);

// Authenticated routes
router.use(authMiddleware);
router.get('/', requireRole(MANAGE), surveyController.list);
router.post('/', requireRole(MANAGE), validate(createSurveySchema), surveyController.create);
router.get('/:id', requireRole(MANAGE), surveyController.getById);
router.patch('/:id', requireRole(MANAGE), validate(updateSurveySchema), surveyController.update);
router.patch('/:id/status', requireRole(MANAGE), validate(changeSurveyStatusSchema), surveyController.changeStatus);
router.delete('/:id', requireRole(MANAGE), surveyController.remove);
router.get('/:id/responses', requireRole(MANAGE), surveyController.getResponses);
router.get('/:id/nps', requireRole([...MANAGE, GERENCIA_HOTEL]), surveyController.getNps);

export { router as surveyRouter };
