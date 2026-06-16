import { Event } from './event.model.js';
import { getPagination, buildMeta } from '../../core/utils/paginate.js';

export const eventRepository = {
  async findAll(query) {
    const { page, limit, skip } = getPagination(query);
    const filter = { active: true };
    if (query.status) filter.status = query.status;
    if (query.companyId) filter.companyId = query.companyId;
    if (query.opportunityId) filter.opportunityId = query.opportunityId;
    if (query.from || query.to) {
      filter.eventDate = {};
      if (query.from) filter.eventDate.$gte = new Date(query.from);
      if (query.to) filter.eventDate.$lte = new Date(query.to);
    }

    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate('companyId', 'name')
        .populate('roomId', 'name')
        .populate('ownerId', 'name')
        .sort({ eventDate: 1 })
        .skip(skip)
        .limit(limit),
      Event.countDocuments(filter),
    ]);
    return { events, meta: buildMeta(page, limit, total) };
  },

  async findById(id) {
    return Event.findById(id)
      .populate('companyId', 'name taxId')
      .populate('opportunityId', 'stage estimatedValue eventType')
      .populate('quoteId', 'number total status')
      .populate('roomId', 'name capacities')
      .populate('ownerId', 'name email')
      .populate('contactId', 'fullName email phone');
  },

  async findByOpportunityId(opportunityId) {
    return Event.findOne({ opportunityId, active: true });
  },

  async create(data) {
    const event = new Event(data);
    return event.save();
  },

  async update(id, data) {
    const event = await Event.findById(id);
    if (!event) return null;
    Object.assign(event, data);
    return event.save();
  },

  async changeStatus(id, status) {
    return Event.findByIdAndUpdate(id, { $set: { status } }, { new: true });
  },

  async softDelete(id) {
    return Event.findByIdAndUpdate(id, { $set: { active: false } }, { new: true });
  },
};
