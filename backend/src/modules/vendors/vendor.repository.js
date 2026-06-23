import { Vendor } from './vendor.model.js';
import { getPagination, buildMeta } from '../../core/utils/paginate.js';

export const vendorRepository = {
  async findAll(query) {
    const { page, limit, skip } = getPagination(query);
    const filter = { active: true };
    if (query.category) filter.category = query.category;
    if (query.q) filter.name = { $regex: query.q, $options: 'i' };

    const [vendors, total] = await Promise.all([
      Vendor.find(filter).sort({ category: 1, name: 1 }).skip(skip).limit(limit),
      Vendor.countDocuments(filter),
    ]);
    return { vendors, meta: buildMeta(page, limit, total) };
  },

  async findById(id) {
    return Vendor.findById(id);
  },

  async create(data) {
    return Vendor.create(data);
  },

  async update(id, data) {
    return Vendor.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
  },

  async softDelete(id) {
    return Vendor.findByIdAndUpdate(id, { $set: { active: false } }, { new: true });
  },
};
