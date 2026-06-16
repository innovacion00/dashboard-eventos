import { Company } from './company.model.js';
import { getPagination, buildMeta } from '../../core/utils/paginate.js';

export const companyRepository = {
  async findAll(query) {
    const { page, limit, skip } = getPagination(query);
    const filter = { active: true };
    if (query.status) filter.status = query.status;
    if (query.segment) filter.segment = query.segment;
    if (query.owner) filter.ownerId = query.owner;
    if (query.q) filter.$text = { $search: query.q };

    const [companies, total] = await Promise.all([
      Company.find(filter).populate('ownerId', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Company.countDocuments(filter),
    ]);
    return { companies, meta: buildMeta(page, limit, total) };
  },

  async findById(id) {
    return Company.findById(id).populate('ownerId', 'name email');
  },

  async create(data) {
    return Company.create(data);
  },

  async update(id, data) {
    return Company.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).populate('ownerId', 'name email');
  },

  async softDelete(id) {
    return Company.findByIdAndUpdate(id, { $set: { active: false } }, { new: true });
  },

  async bulkCreate(dataArray) {
    const docs = await Company.insertMany(dataArray, { ordered: false });
    return docs.length;
  },

  async hasRelations(id) {
    // lazy import to avoid circular deps
    const { Opportunity } = await import('../opportunities/opportunity.model.js');
    const count = await Opportunity.countDocuments({ companyId: id, active: true });
    return count > 0;
  },
};
