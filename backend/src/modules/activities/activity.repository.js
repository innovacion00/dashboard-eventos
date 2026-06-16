import { Activity } from './activity.model.js';
import { getPagination, buildMeta } from '../../core/utils/paginate.js';

export const activityRepository = {
  async findAll(query) {
    const { page, limit, skip } = getPagination(query);
    const filter = {};
    if (query.companyId) filter.companyId = query.companyId;
    if (query.ownerId) filter.ownerId = query.ownerId;
    if (query.type) filter.type = query.type;
    if (query.from || query.to) {
      filter.date = {};
      if (query.from) filter.date.$gte = new Date(query.from);
      if (query.to) filter.date.$lte = new Date(query.to);
    }

    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .populate('companyId', 'name')
        .populate('ownerId', 'name email')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Activity.countDocuments(filter),
    ]);
    return { activities, meta: buildMeta(page, limit, total) };
  },

  async create(data) {
    return Activity.create(data);
  },
};
