import { goalService } from './goal.service.js';
import { asyncHandler } from '../../core/utils/async-handler.js';
import { successResponse } from '../../core/utils/response.js';

export const goalController = {
  get: asyncHandler(async (req, res) => {
    const data = await goalService.getGoal(req.query);
    if (Array.isArray(data)) {
      successResponse(res, data.map(mapGoal));
    } else {
      successResponse(res, data ? mapGoal(data) : null);
    }
  }),

  create: asyncHandler(async (req, res) => {
    const goal = await goalService.createGoal(req.body, req.user, req);
    successResponse(res, mapGoal(goal), 201);
  }),

  update: asyncHandler(async (req, res) => {
    const goal = await goalService.updateGoal(req.params.id, req.body, req.user, req);
    successResponse(res, mapGoal(goal));
  }),

  remove: asyncHandler(async (req, res) => {
    await goalService.deleteGoal(req.params.id, req.user, req);
    successResponse(res, { message: 'Meta eliminada correctamente' });
  }),
};

function mapGoal(g) {
  return {
    id: g._id,
    year: g.year,
    month: g.month,
    user: g.userId || null,
    revenueTarget: g.revenueTarget,
    eventCountTarget: g.eventCountTarget,
    averageTicketTarget: g.averageTicketTarget,
    marginTarget: g.marginTarget,
    presaleThreshold: g.presaleThreshold,
    createdBy: g.createdBy,
    createdAt: g.createdAt,
  };
}
