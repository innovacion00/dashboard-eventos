import { Service } from './service.model.js';
import { getPagination, buildMeta } from '../../core/utils/paginate.js';

export const serviceRepository = {
  async findAll(query) {
    const { page, limit, skip } = getPagination(query);
    const filter = { active: true };
    if (query.category) filter.category = query.category;

    const [services, total] = await Promise.all([
      Service.find(filter).sort({ category: 1, name: 1 }).skip(skip).limit(limit),
      Service.countDocuments(filter),
    ]);
    return { services, meta: buildMeta(page, limit, total) };
  },

  async findById(id) {
    return Service.findById(id);
  },

  async create(data) {
    return Service.create(data);
  },

  async update(id, data) {
    return Service.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
  },

  async softDelete(id) {
    return Service.findByIdAndUpdate(id, { $set: { active: false } }, { new: true });
  },
};
