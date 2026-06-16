import { eventService } from './event.service.js';
import { asyncHandler } from '../../core/utils/async-handler.js';
import { successResponse } from '../../core/utils/response.js';

export const eventController = {
  list: asyncHandler(async (req, res) => {
    const { events, meta } = await eventService.listEvents(req.query);
    successResponse(res, events.map(mapEvent), 200, meta);
  }),

  getById: asyncHandler(async (req, res) => {
    const event = await eventService.getEventById(req.params.id);
    successResponse(res, mapEvent(event));
  }),

  create: asyncHandler(async (req, res) => {
    const event = await eventService.createEvent(req.body, req.user, req);
    successResponse(res, mapEvent(event), 201);
  }),

  update: asyncHandler(async (req, res) => {
    const event = await eventService.updateEvent(req.params.id, req.body, req.user, req);
    successResponse(res, mapEvent(event));
  }),

  changeStatus: asyncHandler(async (req, res) => {
    const event = await eventService.changeStatus(req.params.id, req.body.status, req.user, req);
    successResponse(res, mapEvent(event));
  }),

  remove: asyncHandler(async (req, res) => {
    await eventService.deleteEvent(req.params.id, req.user, req);
    successResponse(res, null, 204);
  }),
};

function mapEvent(e) {
  return {
    id: e._id,
    number: e.number,
    opportunityId: e.opportunityId,
    quote: e.quoteId,
    company: e.companyId,
    contact: e.contactId,
    owner: e.ownerId,
    name: e.name,
    eventType: e.eventType,
    room: e.roomId,
    eventDate: e.eventDate,
    startTime: e.startTime,
    endTime: e.endTime,
    attendees: e.attendees,
    setupType: e.setupType,
    status: e.status,
    totalValue: e.totalValue,
    notes: e.notes,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  };
}
