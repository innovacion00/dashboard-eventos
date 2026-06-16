import { EventCost } from './event-cost.model.js';

export const eventCostRepository = {
  async findByEvent(eventId) {
    return EventCost.find({ eventId, active: true }).sort({ category: 1, createdAt: 1 });
  },

  async findById(id) {
    return EventCost.findById(id);
  },

  async create(data) {
    return EventCost.create(data);
  },

  async update(id, data) {
    return EventCost.findByIdAndUpdate(id, data, { new: true });
  },

  async softDelete(id) {
    return EventCost.findByIdAndUpdate(id, { active: false }, { new: true });
  },

  async summaryByEvent(eventId) {
    const costs = await EventCost.find({ eventId, active: true });
    const totalEstimated = costs.reduce((s, c) => s + c.estimatedAmount, 0);
    const totalActual = costs.reduce((s, c) => s + c.actualAmount, 0);
    const byCategory = {};
    for (const c of costs) {
      if (!byCategory[c.category]) byCategory[c.category] = { estimated: 0, actual: 0 };
      byCategory[c.category].estimated += c.estimatedAmount;
      byCategory[c.category].actual += c.actualAmount;
    }
    return { totalEstimated, totalActual, byCategory };
  },
};
