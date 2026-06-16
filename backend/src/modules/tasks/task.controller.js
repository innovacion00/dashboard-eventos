import { taskService } from './task.service.js';
import { asyncHandler } from '../../core/utils/async-handler.js';
import { successResponse } from '../../core/utils/response.js';

export const taskController = {
  list: asyncHandler(async (req, res) => {
    const { tasks, meta } = await taskService.listTasks(req.query, req.user);
    successResponse(res, tasks, 200, meta);
  }),

  create: asyncHandler(async (req, res) => {
    const task = await taskService.createTask(req.body, req.user, req);
    successResponse(res, task, 201);
  }),

  update: asyncHandler(async (req, res) => {
    const task = await taskService.updateTask(req.params.id, req.body, req.user, req);
    successResponse(res, task);
  }),

  changeStatus: asyncHandler(async (req, res) => {
    const task = await taskService.changeStatus(req.params.id, req.body.status, req.user, req);
    successResponse(res, task);
  }),
};
