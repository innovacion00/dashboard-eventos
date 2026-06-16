import { dashboardService } from './dashboard.service.js';
import { asyncHandler } from '../../core/utils/async-handler.js';
import { successResponse } from '../../core/utils/response.js';

export const dashboardController = {
  snapshot: asyncHandler(async (req, res) => {
    const now = new Date();
    const year = req.query.year || now.getFullYear();
    const month = req.query.month || now.getMonth() + 1;
    const snapshot = await dashboardService.getMonthlySnapshot(year, month);
    successResponse(res, snapshot);
  }),
};
