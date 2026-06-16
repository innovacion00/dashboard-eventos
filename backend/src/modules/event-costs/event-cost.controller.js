import { eventCostService } from './event-cost.service.js';
import { asyncHandler } from '../../core/utils/async-handler.js';
import { successResponse } from '../../core/utils/response.js';

function mapCost(c) {
  return {
    id: c._id,
    eventId: c.eventId,
    category: c.category,
    description: c.description,
    estimatedAmount: c.estimatedAmount,
    actualAmount: c.actualAmount,
    vendor: c.vendor,
    notes: c.notes,
    createdAt: c.createdAt,
  };
}

export const eventCostController = {
  listByEvent: asyncHandler(async (req, res) => {
    const costs = await eventCostService.listByEvent(req.params.eventId);
    successResponse(res, costs.map(mapCost));
  }),

  getSummary: asyncHandler(async (req, res) => {
    const revenue = parseFloat(req.query.revenue || '0');
    const summary = await eventCostService.getSummary(req.params.eventId, revenue);
    successResponse(res, summary);
  }),

  create: asyncHandler(async (req, res) => {
    const cost = await eventCostService.createCost(req.body, req.user, req);
    successResponse(res, mapCost(cost), undefined, 201);
  }),

  update: asyncHandler(async (req, res) => {
    const cost = await eventCostService.updateCost(req.params.id, req.body, req.user, req);
    successResponse(res, mapCost(cost));
  }),

  remove: asyncHandler(async (req, res) => {
    await eventCostService.deleteCost(req.params.id, req.user, req);
    successResponse(res, { message: 'Costo eliminado correctamente' });
  }),
};
