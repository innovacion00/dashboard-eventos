import { goalService } from './goal.service.js';
import { asyncHandler } from '../../core/utils/async-handler.js';
import { successResponse } from '../../core/utils/response.js';

export const goalController = {
  get: asyncHandler(async (req, res) => {
    const data = await goalService.getGoal(req.query.year, req.query.month);
    successResponse(res, data);
  }),

  create: asyncHandler(async (req, res) => {
    const goal = await goalService.createGoal(req.body, req.user, req);
    successResponse(res, goal, 201);
  }),

  update: asyncHandler(async (req, res) => {
    const goal = await goalService.updateGoal(req.params.id, req.body, req.user, req);
    successResponse(res, goal);
  }),
};
