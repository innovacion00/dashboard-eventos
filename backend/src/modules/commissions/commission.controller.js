import { commissionService } from './commission.service.js';
import { asyncHandler } from '../../core/utils/async-handler.js';
import { successResponse } from '../../core/utils/response.js';

function mapCommission(c) {
  return {
    id: c._id,
    number: c.number,
    event: c.eventId
      ? { id: c.eventId._id, number: c.eventId.number, name: c.eventId.name, eventDate: c.eventId.eventDate }
      : c.eventId,
    invoice: c.invoiceId
      ? { id: c.invoiceId._id, number: c.invoiceId.number, total: c.invoiceId.total }
      : undefined,
    beneficiary: c.beneficiaryId
      ? { id: c.beneficiaryId._id, name: c.beneficiaryId.name, email: c.beneficiaryId.email }
      : undefined,
    beneficiaryName: c.beneficiaryName,
    beneficiaryType: c.beneficiaryType,
    baseAmount: c.baseAmount,
    rate: c.rate,
    amount: c.amount,
    status: c.status,
    approvedBy: c.approvedBy ? { id: c.approvedBy._id, name: c.approvedBy.name } : undefined,
    approvedAt: c.approvedAt,
    paidAt: c.paidAt,
    notes: c.notes,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

export const commissionController = {
  list: asyncHandler(async (req, res) => {
    const result = await commissionService.listCommissions(req.query);
    successResponse(res, result.data.map(mapCommission), result.meta);
  }),

  getById: asyncHandler(async (req, res) => {
    const com = await commissionService.getCommissionById(req.params.id);
    successResponse(res, mapCommission(com));
  }),

  create: asyncHandler(async (req, res) => {
    const com = await commissionService.createCommission(req.body, req.user, req);
    successResponse(res, mapCommission(com), undefined, 201);
  }),

  update: asyncHandler(async (req, res) => {
    const com = await commissionService.updateCommission(req.params.id, req.body, req.user, req);
    successResponse(res, mapCommission(com));
  }),

  changeStatus: asyncHandler(async (req, res) => {
    const com = await commissionService.changeStatus(req.params.id, req.body.status, req.user, req);
    successResponse(res, mapCommission(com));
  }),

  remove: asyncHandler(async (req, res) => {
    await commissionService.deleteCommission(req.params.id, req.user, req);
    successResponse(res, { message: 'Comisión eliminada correctamente' });
  }),
};
