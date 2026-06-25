import { Quote } from './quote.model.js';
import { getPagination, buildMeta } from '../../core/utils/paginate.js';

export const quoteRepository = {
  async findByOpportunityId(opportunityId) {
    return Quote.findOne({ opportunityId, active: true });
  },

  async findAll(query) {
    const { page, limit, skip } = getPagination(query);
    const filter = { active: true };
    if (query.opportunityId) filter.opportunityId = query.opportunityId;
    if (query.companyId) filter.companyId = query.companyId;
    if (query.status) filter.status = query.status;

    const [quotes, total] = await Promise.all([
      Quote.find(filter)
        .populate('companyId', 'name')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Quote.countDocuments(filter),
    ]);
    return { quotes, meta: buildMeta(page, limit, total) };
  },

  async findById(id) {
    return Quote.findById(id)
      .populate('companyId', 'name taxId email')
      .populate('opportunityId', 'eventType estimatedValue stage')
      .populate('roomId', 'name photos description')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name')
      .populate('items.serviceId', 'name unit');
  },

  async create(data) {
    const quote = new Quote(data);
    return quote.save();
  },

  async update(id, data) {
    const quote = await Quote.findById(id);
    if (!quote) return null;
    Object.assign(quote, data);
    return quote.save();
  },

  async changeStatus(id, status, approvedBy) {
    const update = { status };
    if (status === 'APROBADA' && approvedBy) {
      update.approvedBy = approvedBy;
      update.approvedAt = new Date();
    }
    return Quote.findByIdAndUpdate(id, { $set: update }, { new: true });
  },

  async softDelete(id) {
    return Quote.findByIdAndUpdate(id, { $set: { active: false } }, { new: true });
  },
};
