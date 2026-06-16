import { opportunityRepository } from './opportunity.repository.js';
import { companyRepository } from '../companies/company.repository.js';
import { NotFoundError } from '../../core/errors/NotFoundError.js';
import { audit } from '../audit/audit.service.js';
import { STAGE_CODES } from '../../core/constants/stages.js';
import { AppError } from '../../core/errors/AppError.js';

export const opportunityService = {
  async listOpportunities(query) {
    return opportunityRepository.findAll(query);
  },

  async getOpportunityById(id) {
    const opp = await opportunityRepository.findById(id);
    if (!opp || !opp.active) throw new NotFoundError('Oportunidad no encontrada');
    return opp;
  },

  async createOpportunity(data, requestingUser, req) {
    const company = await companyRepository.findById(data.companyId);
    if (!company || !company.active) throw new NotFoundError('Empresa no encontrada');

    const opp = await opportunityRepository.create({
      ...data,
      ownerId: requestingUser.id,
      stage: data.stage || 'PROSPECTO_INICIAL',
    });

    await opportunityRepository.addHistory({
      opportunityId: opp._id,
      fromStage: null,
      toStage: opp.stage,
      changedBy: requestingUser.id,
      changedAt: new Date(),
    });

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'opportunities',
      action: 'CREATE',
      entityId: opp._id,
      after: { companyId: opp.companyId, stage: opp.stage, estimatedValue: opp.estimatedValue },
      req,
    });

    return opp;
  },

  async updateOpportunity(id, data, requestingUser, req) {
    const opp = await opportunityRepository.findById(id);
    if (!opp || !opp.active) throw new NotFoundError('Oportunidad no encontrada');

    const before = { stage: opp.stage, estimatedValue: opp.estimatedValue };
    const updated = await opportunityRepository.update(id, data);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'opportunities',
      action: 'UPDATE',
      entityId: id,
      before,
      after: data,
      req,
    });

    return updated;
  },

  async changeStage(id, newStage, requestingUser, req) {
    if (!STAGE_CODES.includes(newStage)) {
      throw new AppError('Etapa inválida', 422, 'VALIDATION_ERROR');
    }

    const opp = await opportunityRepository.findById(id);
    if (!opp || !opp.active) throw new NotFoundError('Oportunidad no encontrada');

    const fromStage = opp.stage;
    if (fromStage === newStage) return opp;

    const updated = await opportunityRepository.update(id, { stage: newStage });

    // Auto-create event when opportunity is confirmed
    if (newStage === 'CONFIRMADO') {
      const { eventService } = await import('../events/event.service.js');
      await eventService.createFromOpportunity(updated, requestingUser, req);
    }

    await opportunityRepository.addHistory({
      opportunityId: id,
      fromStage,
      toStage: newStage,
      changedBy: requestingUser.id,
      changedAt: new Date(),
    });

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'opportunities',
      action: 'STAGE_CHANGE',
      entityId: id,
      before: { stage: fromStage },
      after: { stage: newStage },
      req,
    });

    return updated;
  },

  async getHistory(id) {
    const opp = await opportunityRepository.findById(id);
    if (!opp) throw new NotFoundError('Oportunidad no encontrada');
    return opportunityRepository.getHistory(id);
  },
};
