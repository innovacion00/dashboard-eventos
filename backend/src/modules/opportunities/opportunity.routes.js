import { Router } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware.js';
import { validate } from '../../core/middlewares/validate.middleware.js';
import { opportunityController } from './opportunity.controller.js';
import { createOpportunitySchema, updateOpportunitySchema, changeStageSchema } from './opportunity.validation.js';

const router = Router();

router.use(authMiddleware);

router.get('/', opportunityController.list);
router.post('/', validate(createOpportunitySchema), opportunityController.create);
router.get('/:id', opportunityController.getById);
router.patch('/:id', validate(updateOpportunitySchema), opportunityController.update);
router.patch('/:id/stage', validate(changeStageSchema), opportunityController.changeStage);
router.get('/:id/history', opportunityController.getHistory);

export { router as opportunityRouter };
