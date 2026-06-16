import { eventCostRepository } from './event-cost.repository.js';
import { NotFoundError } from '../../core/errors/NotFoundError.js';
import { audit } from '../audit/audit.service.js';

export const eventCostService = {
  async listByEvent(eventId) {
    return eventCostRepository.findByEvent(eventId);
  },

  async getSummary(eventId, invoiceTotal = 0) {
    const { totalEstimated, totalActual, byCategory } = await eventCostRepository.summaryByEvent(eventId);
    const revenue = invoiceTotal;
    const grossMargin = revenue - totalActual;
    const marginRate = revenue > 0 ? Math.round((grossMargin / revenue) * 10000) / 100 : 0;
    return { revenue, totalEstimated, totalActual, grossMargin, marginRate, byCategory };
  },

  async createCost(data, requestingUser, req) {
    const cost = await eventCostRepository.create({ ...data, createdBy: requestingUser.id });

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'event-costs',
      action: 'CREATE',
      entityId: cost._id,
      after: { eventId: cost.eventId, category: cost.category, actualAmount: cost.actualAmount },
      req,
    });

    return cost;
  },

  async updateCost(id, data, requestingUser, req) {
    const cost = await eventCostRepository.findById(id);
    if (!cost || !cost.active) throw new NotFoundError('Costo no encontrado');

    const before = { estimatedAmount: cost.estimatedAmount, actualAmount: cost.actualAmount };
    const updated = await eventCostRepository.update(id, data);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'event-costs',
      action: 'UPDATE',
      entityId: id,
      before,
      after: { estimatedAmount: updated.estimatedAmount, actualAmount: updated.actualAmount },
      req,
    });

    return updated;
  },

  async deleteCost(id, requestingUser, req) {
    const cost = await eventCostRepository.findById(id);
    if (!cost || !cost.active) throw new NotFoundError('Costo no encontrado');

    await eventCostRepository.softDelete(id);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'event-costs',
      action: 'DELETE',
      entityId: id,
      before: { description: cost.description, actualAmount: cost.actualAmount },
      req,
    });
  },
};
