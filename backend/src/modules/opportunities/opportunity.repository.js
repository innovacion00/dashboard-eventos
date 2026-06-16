import { Opportunity } from './opportunity.model.js';
import { OpportunityHistory } from './opportunity-history.model.js';
import { getPagination, buildMeta } from '../../core/utils/paginate.js';

export const opportunityRepository = {
  async findAll(query) {
    const { page, limit, skip } = getPagination(query);
    const filter = { active: true };
    if (query.stage) filter.stage = query.stage;
    if (query.owner) filter.ownerId = query.owner;
    if (query.companyId) filter.companyId = query.companyId;
    if (query.month) filter.projectionMonth = query.month;
    if (query.from || query.to) {
      filter.estimatedEventDate = {};
      if (query.from) filter.estimatedEventDate.$gte = new Date(query.from);
      if (query.to) filter.estimatedEventDate.$lte = new Date(query.to);
    }

    const [opportunities, total] = await Promise.all([
      Opportunity.find(filter)
        .populate('companyId', 'name')
        .populate('ownerId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Opportunity.countDocuments(filter),
    ]);
    return { opportunities, meta: buildMeta(page, limit, total) };
  },

  async findById(id) {
    return Opportunity.findById(id).populate('companyId', 'name').populate('ownerId', 'name email');
  },

  async create(data) {
    const opp = new Opportunity(data);
    return opp.save();
  },

  async update(id, data) {
    const opp = await Opportunity.findById(id);
    if (!opp) return null;
    Object.assign(opp, data);
    return opp.save();
  },

  async softDelete(id) {
    return Opportunity.findByIdAndUpdate(id, { $set: { active: false } }, { new: true });
  },

  async getHistory(opportunityId) {
    return OpportunityHistory.find({ opportunityId })
      .populate('changedBy', 'name email')
      .sort({ changedAt: -1 });
  },

  async addHistory(data) {
    return OpportunityHistory.create(data);
  },
};
