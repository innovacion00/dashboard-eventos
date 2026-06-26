import { eventCostRepository } from './event-cost.repository.js';
import { NotFoundError } from '../../core/errors/NotFoundError.js';
import { audit } from '../audit/audit.service.js';
import { Event } from '../events/event.model.js';
import { Quote } from '../quotes/quote.model.js';

const CATEGORY_COST_RATE = {
  AB: 0.70,
  AV: 0.50,
  SALON: 0.00,
  OTROS: 0.70,
  EXTERNO: 0.70,
};

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

  async getProfitBreakdown(eventId) {
    const event = await Event.findById(eventId);
    if (!event || !event.active) throw new NotFoundError('Evento no encontrado');
    if (!event.quoteId) return { categories: [], totals: { revenue: 0, cost: 0, profit: 0 } };

    const quote = await Quote.findById(event.quoteId);
    if (!quote) return { categories: [], totals: { revenue: 0, cost: 0, profit: 0 } };

    const grouped = {};
    for (const item of quote.items) {
      const cat = item.category || 'OTROS';
      if (!grouped[cat]) grouped[cat] = 0;
      grouped[cat] += item.total;
    }

    const categories = [];
    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;

    for (const [category, revenue] of Object.entries(grouped)) {
      const costRate = CATEGORY_COST_RATE[category] ?? 0.70;
      const profitRate = 1 - costRate;
      const cost = Math.round(revenue * costRate * 100) / 100;
      const profit = Math.round(revenue * profitRate * 100) / 100;
      categories.push({
        category,
        revenue: Math.round(revenue * 100) / 100,
        costRate,
        cost,
        profitRate,
        profit,
      });
      totalRevenue += revenue;
      totalCost += cost;
      totalProfit += profit;
    }

    return {
      categories,
      totals: {
        revenue: Math.round(totalRevenue * 100) / 100,
        cost: Math.round(totalCost * 100) / 100,
        profit: Math.round(totalProfit * 100) / 100,
        profitRate: totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 10000) / 100 : 0,
      },
    };
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
