import { Router } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware.js';
import { validate } from '../../core/middlewares/validate.middleware.js';
import { taskController } from './task.controller.js';
import { createTaskSchema, updateTaskSchema, changeTaskStatusSchema } from './task.validation.js';

const router = Router();

router.use(authMiddleware);

router.get('/', taskController.list);
router.post('/', validate(createTaskSchema), taskController.create);
router.patch('/:id', validate(updateTaskSchema), taskController.update);
router.patch('/:id/status', validate(changeTaskStatusSchema), taskController.changeStatus);

export { router as taskRouter };
