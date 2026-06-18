import { activityService } from './activity.service.js';
import { asyncHandler } from '../../core/utils/async-handler.js';
import { successResponse } from '../../core/utils/response.js';

function mapAttachment(file, req) {
  const base = `${req.protocol}://${req.get('host')}/uploads/activities`;
  return {
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    url: `${base}/${file.filename}`,
  };
}

export const activityController = {
  list: asyncHandler(async (req, res) => {
    const { activities: raw, meta } = await activityService.listActivities(req.query);
    const base = `${req.protocol}://${req.get('host')}/uploads/activities`;
    const activities = raw.map((a) => {
      const obj = a.toObject ? a.toObject() : a;
      obj.attachments = (obj.attachments || []).map((att) => ({
        ...att,
        url: `${base}/${att.filename}`,
      }));
      return obj;
    });
    successResponse(res, activities, 200, meta);
  }),

  create: asyncHandler(async (req, res) => {
    const attachments = (req.files || []).map((f) => ({
      filename: f.filename,
      originalName: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
    }));
    const activity = await activityService.createActivity(
      { ...req.body, attachments },
      req.user,
      req
    );

    const activityObj = activity.toObject();
    activityObj.attachments = (activityObj.attachments || []).map((a) => ({
      ...a,
      url: `${req.protocol}://${req.get('host')}/uploads/activities/${a.filename}`,
    }));

    successResponse(res, activityObj, 201);
  }),
};
