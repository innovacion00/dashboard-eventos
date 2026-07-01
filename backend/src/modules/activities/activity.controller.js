import { activityService } from './activity.service.js';
import { asyncHandler } from '../../core/utils/async-handler.js';
import { successResponse } from '../../core/utils/response.js';
import { uploadToSpaces } from '../../core/utils/spaces.js';

export const activityController = {
  list: asyncHandler(async (req, res) => {
    const { activities: raw, meta } = await activityService.listActivities(req.query);
    const activities = raw.map((a) => {
      const obj = a.toObject ? a.toObject() : { ...a };
      // Backward compat: old activities stored local filename, new ones store Spaces url
      obj.attachments = (obj.attachments || []).filter(att => {
        const u = att.url;
        return u && typeof u === 'string' && !u.includes('undefined') && u.startsWith('http');
      });
      return obj;
    });
    successResponse(res, activities, 200, meta);
  }),

  create: asyncHandler(async (req, res) => {
    const attachments = await Promise.all(
      (req.files || []).map(async (f) => {
        const url = await uploadToSpaces(f.buffer, f.mimetype, 'activities', f.originalname);
        return {
          url,
          originalName: f.originalname,
          mimetype: f.mimetype,
          size: f.size,
        };
      })
    );

    const activity = await activityService.createActivity(
      { ...req.body, attachments },
      req.user,
      req
    );

    successResponse(res, activity, 201);
  }),
};
