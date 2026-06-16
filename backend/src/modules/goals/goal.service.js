import { goalRepository } from './goal.repository.js';
import { ConflictError } from '../../core/errors/ConflictError.js';
import { NotFoundError } from '../../core/errors/NotFoundError.js';
import { audit } from '../audit/audit.service.js';

export const goalService = {
  async getGoal(year, month) {
    if (year && month) {
      return goalRepository.findByYearMonth(year, month);
    }
    return goalRepository.findAll();
  },

  async createGoal(data, requestingUser, req) {
    const existing = await goalRepository.findByYearMonth(data.year, data.month);
    if (existing) {
      throw new ConflictError(`Ya existe una meta para ${data.month}/${data.year}`);
    }

    const goal = await goalRepository.create({ ...data, createdBy: requestingUser.id });

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'goals',
      action: 'CREATE',
      entityId: goal._id,
      after: { year: goal.year, month: goal.month, revenueTarget: goal.revenueTarget },
      req,
    });

    return goal;
  },

  async updateGoal(id, data, requestingUser, req) {
    const goal = await goalRepository.findById(id);
    if (!goal) throw new NotFoundError('Meta no encontrada');

    const before = { revenueTarget: goal.revenueTarget, eventCountTarget: goal.eventCountTarget };
    const updated = await goalRepository.update(id, data);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'goals',
      action: 'UPDATE',
      entityId: id,
      before,
      after: data,
      req,
    });

    return updated;
  },
};
