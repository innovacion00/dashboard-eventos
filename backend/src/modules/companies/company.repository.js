import { Company } from './company.model.js';
import { getPagination, buildMeta } from '../../core/utils/paginate.js';

export const companyRepository = {
  async findAll(query) {
    const { page, limit, skip } = getPagination(query);
    const filter = { active: true };
    if (query.status) filter.status = query.status;
    if (query.segment) filter.segment = query.segment;
    if (query.owner) filter.ownerId = query.owner;
    if (query.q) filter.name = { $regex: query.q, $options: 'i' };

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
    try {
      const docs = await Company.insertMany(dataArray, { ordered: false });
      return docs.length;
    } catch (err) {
      if (err.name === 'MongoBulkWriteError') {
        return err.result?.insertedCount ?? 0;
      }
      throw err;
    }
  },

  async distinctSegments() {
    return Company.distinct('segment', { active: true, segment: { $ne: null, $ne: '' } });
  },

  async hasRelations(id) {
    // lazy import to avoid circular deps
    const { Opportunity } = await import('../opportunities/opportunity.model.js');
    const count = await Opportunity.countDocuments({ companyId: id, active: true });
    return count > 0;
  },
};
