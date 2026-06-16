import { opportunityService } from './opportunity.service.js';
import { asyncHandler } from '../../core/utils/async-handler.js';
import { successResponse } from '../../core/utils/response.js';

export const opportunityController = {
  list: asyncHandler(async (req, res) => {
    const { opportunities, meta } = await opportunityService.listOpportunities(req.query);
    successResponse(res, opportunities.map(mapOpportunity), 200, meta);
  }),

  getById: asyncHandler(async (req, res) => {
    const opp = await opportunityService.getOpportunityById(req.params.id);
    successResponse(res, mapOpportunity(opp));
  }),

  create: asyncHandler(async (req, res) => {
    const opp = await opportunityService.createOpportunity(req.body, req.user, req);
    successResponse(res, mapOpportunity(opp), 201);
  }),

  update: asyncHandler(async (req, res) => {
    const opp = await opportunityService.updateOpportunity(req.params.id, req.body, req.user, req);
    successResponse(res, mapOpportunity(opp));
  }),

  changeStage: asyncHandler(async (req, res) => {
    const opp = await opportunityService.changeStage(req.params.id, req.body.stage, req.user, req);
    successResponse(res, mapOpportunity(opp));
  }),

  getHistory: asyncHandler(async (req, res) => {
    const history = await opportunityService.getHistory(req.params.id);
    successResponse(res, history);
  }),
};

function mapOpportunity(o) {
  return {
    id: o._id,
    company: o.companyId,
    owner: o.ownerId,
    eventType: o.eventType,
    segment: o.segment,
    probableRoomId: o.probableRoomId,
    estimatedEventDate: o.estimatedEventDate,
    projectionMonth: o.projectionMonth,
    attendees: o.attendees,
    estimatedValue: o.estimatedValue,
    stage: o.stage,
    probability: o.probability,
    weightedValue: o.weightedValue,
    nextActionAt: o.nextActionAt,
    nextActionDescription: o.nextActionDescription,
    notes: o.notes,
    isOverdue:
      o.nextActionAt &&
      o.nextActionAt < new Date() &&
      o.stage !== 'PERDIDO' &&
      o.stage !== 'CONFIRMADO',
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}
