import { planningService } from './planning.service.js';
import { asyncHandler } from '../../core/utils/async-handler.js';
import { successResponse } from '../../core/utils/response.js';

export const planningController = {
  getOccupations: asyncHandler(async (req, res) => {
    const { roomId, startDate, endDate } = req.query;
    const occupations = await planningService.getOccupations({ roomId, startDate, endDate });
    successResponse(res, occupations);
  }),
};
