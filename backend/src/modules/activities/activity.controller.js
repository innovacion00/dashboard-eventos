import { activityService } from './activity.service.js';
import { asyncHandler } from '../../core/utils/async-handler.js';
import { successResponse } from '../../core/utils/response.js';

export const activityController = {
  list: asyncHandler(async (req, res) => {
    const { activities, meta } = await activityService.listActivities(req.query);
    successResponse(res, activities, 200, meta);
  }),

  create: asyncHandler(async (req, res) => {
    const activity = await activityService.createActivity(req.body, req.user, req);
    successResponse(res, activity, 201);
  }),
};
