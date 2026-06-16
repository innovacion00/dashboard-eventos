import { activityRepository } from './activity.repository.js';
import { companyRepository } from '../companies/company.repository.js';
import { NotFoundError } from '../../core/errors/NotFoundError.js';
import { audit } from '../audit/audit.service.js';
import { Company } from '../companies/company.model.js';

export const activityService = {
  async listActivities(query) {
    return activityRepository.findAll(query);
  },

  async createActivity(data, requestingUser, req) {
    const company = await companyRepository.findById(data.companyId);
    if (!company || !company.active) throw new NotFoundError('Empresa no encontrada');

    const activity = await activityRepository.create({
      ...data,
      ownerId: requestingUser.id,
      date: data.date ? new Date(data.date) : new Date(),
      completed: true,
    });

    // Si hay próxima acción, reemplaza la de la empresa (regla de negocio)
    if (data.nextActionAt || data.nextActionDescription) {
      await Company.findByIdAndUpdate(data.companyId, {
        $set: {
          lastContactAt: activity.date,
          nextActionAt: data.nextActionAt ? new Date(data.nextActionAt) : undefined,
          nextActionDescription: data.nextActionDescription,
        },
      });
    } else {
      await Company.findByIdAndUpdate(data.companyId, {
        $set: { lastContactAt: activity.date },
      });
    }

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'activities',
      action: 'CREATE',
      entityId: activity._id,
      after: { type: activity.type, companyId: activity.companyId, date: activity.date },
      req,
    });

    return activity;
  },
};
