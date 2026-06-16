import { quoteService } from './quote.service.js';
import { asyncHandler } from '../../core/utils/async-handler.js';
import { successResponse } from '../../core/utils/response.js';

export const quoteController = {
  list: asyncHandler(async (req, res) => {
    const { quotes, meta } = await quoteService.listQuotes(req.query);
    successResponse(res, quotes.map(mapQuote), 200, meta);
  }),

  getById: asyncHandler(async (req, res) => {
    const quote = await quoteService.getQuoteById(req.params.id);
    successResponse(res, mapQuote(quote));
  }),

  create: asyncHandler(async (req, res) => {
    const quote = await quoteService.createQuote(req.body, req.user, req);
    successResponse(res, mapQuote(quote), 201);
  }),

  update: asyncHandler(async (req, res) => {
    const quote = await quoteService.updateQuote(req.params.id, req.body, req.user, req);
    successResponse(res, mapQuote(quote));
  }),

  changeStatus: asyncHandler(async (req, res) => {
    const quote = await quoteService.changeStatus(req.params.id, req.body.status, req.user, req);
    successResponse(res, mapQuote(quote));
  }),

  remove: asyncHandler(async (req, res) => {
    await quoteService.deleteQuote(req.params.id, req.user, req);
    successResponse(res, null, 204);
  }),
};

function mapQuote(q) {
  return {
    id: q._id,
    number: q.number,
    version: q.version,
    opportunityId: q.opportunityId,
    company: q.companyId,
    status: q.status,
    validUntil: q.validUntil,
    eventDate: q.eventDate,
    eventType: q.eventType,
    room: q.roomId,
    attendees: q.attendees,
    items: (q.items || []).map(item => ({
      id: item._id,
      description: item.description,
      service: item.serviceId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
      category: item.category,
    })),
    subtotal: q.subtotal,
    taxRate: q.taxRate,
    taxAmount: q.taxAmount,
    total: q.total,
    notes: q.notes,
    internalNotes: q.internalNotes,
    createdBy: q.createdBy,
    approvedBy: q.approvedBy,
    approvedAt: q.approvedAt,
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
  };
}
