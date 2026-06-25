import { historicalSaleService } from './historical-sale.service.js';
import { asyncHandler } from '../../core/utils/async-handler.js';
import { successResponse } from '../../core/utils/response.js';

export const historicalSaleController = {
  list: asyncHandler(async (req, res) => {
    const data = await historicalSaleService.list(req.query);
    successResponse(res, data);
  }),

  summary: asyncHandler(async (req, res) => {
    const data = await historicalSaleService.summaryByYear(req.params.year);
    successResponse(res, data);
  }),

  create: asyncHandler(async (req, res) => {
    const sale = await historicalSaleService.create(req.body, req.user, req);
    successResponse(res, sale, 201);
  }),

  update: asyncHandler(async (req, res) => {
    const sale = await historicalSaleService.update(req.params.id, req.body, req.user, req);
    successResponse(res, sale);
  }),

  remove: asyncHandler(async (req, res) => {
    await historicalSaleService.remove(req.params.id, req.user, req);
    successResponse(res, null, 204);
  }),
};
