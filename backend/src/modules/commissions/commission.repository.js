import { Commission } from './commission.model.js';
import { getPagination, buildMeta } from '../../core/utils/paginate.js';

export const commissionRepository = {
  async findAll(query) {
    const { eventId, beneficiaryId, status } = query;
    const { page, limit, skip } = getPagination(query);

    const filter = { active: true };
    if (eventId) filter.eventId = eventId;
    if (beneficiaryId) filter.beneficiaryId = beneficiaryId;
    if (status) filter.status = status;

    const [data, total] = await Promise.all([
      Commission.find(filter)
        .populate('eventId', 'number name')
        .populate('beneficiaryId', 'name email')
        .populate('approvedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Commission.countDocuments(filter),
    ]);

    return { data, meta: buildMeta(page, limit, total) };
  },

  async findById(id) {
    return Commission.findById(id)
      .populate('eventId', 'number name eventDate totalValue')
      .populate('invoiceId', 'number total')
      .populate('beneficiaryId', 'name email role')
      .populate('approvedBy', 'name email')
      .populate('createdBy', 'name email');
  },

  async create(data) {
    const com = new Commission(data);
    return com.save();
  },

  async update(id, data) {
    const com = await Commission.findById(id);
    if (!com) return null;
    Object.assign(com, data);
    return com.save();
  },

  async changeStatus(id, status, userId) {
    const com = await Commission.findById(id);
    if (!com) return null;
    com.status = status;
    if (status === 'APROBADA') {
      com.approvedBy = userId;
      com.approvedAt = new Date();
    }
    if (status === 'PAGADA') {
      com.paidAt = new Date();
    }
    return com.save();
  },

  async softDelete(id) {
    const com = await Commission.findById(id);
    if (!com) return null;
    com.active = false;
    return com.save();
  },
};
