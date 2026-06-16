import { Invoice } from './invoice.model.js';
import { getPagination, buildMeta } from '../../core/utils/paginate.js';

export const invoiceRepository = {
  async findAll(query) {
    const { eventId, companyId, status, year, month } = query;
    const { page, limit, skip } = getPagination(query);

    const filter = { active: true };
    if (eventId) filter.eventId = eventId;
    if (companyId) filter.companyId = companyId;
    if (status) filter.status = status;
    if (year || month) {
      const y = parseInt(year || new Date().getFullYear(), 10);
      const m = month ? parseInt(month, 10) - 1 : 0;
      const start = new Date(y, month ? m : 0, 1);
      const end = month ? new Date(y, m + 1, 1) : new Date(y + 1, 0, 1);
      filter.issueDate = { $gte: start, $lt: end };
    }

    const [data, total] = await Promise.all([
      Invoice.find(filter)
        .populate('eventId', 'number name eventDate')
        .populate('companyId', 'name')
        .sort({ issueDate: -1 })
        .skip(skip)
        .limit(limit),
      Invoice.countDocuments(filter),
    ]);

    return { data, meta: buildMeta(page, limit, total) };
  },

  async findById(id) {
    return Invoice.findById(id)
      .populate('eventId', 'number name eventDate')
      .populate('companyId', 'name taxId')
      .populate('quoteId', 'number total')
      .populate('createdBy', 'name email');
  },

  async create(data) {
    const inv = new Invoice(data);
    return inv.save();
  },

  async update(id, data) {
    const inv = await Invoice.findById(id);
    if (!inv) return null;
    Object.assign(inv, data);
    return inv.save();
  },

  async addPayment(id, paymentData) {
    const inv = await Invoice.findById(id);
    if (!inv) return null;
    inv.payments.push(paymentData);
    return inv.save();
  },

  async cancelPayment(invoiceId, paymentId) {
    const inv = await Invoice.findById(invoiceId);
    if (!inv) return null;
    const payment = inv.payments.id(paymentId);
    if (!payment) return null;
    payment.status = 'ANULADO';
    return inv.save();
  },

  async changeStatus(id, status) {
    const inv = await Invoice.findById(id);
    if (!inv) return null;
    inv.status = status;
    return inv.save();
  },

  async softDelete(id) {
    const inv = await Invoice.findById(id);
    if (!inv) return null;
    inv.active = false;
    return inv.save();
  },
};
