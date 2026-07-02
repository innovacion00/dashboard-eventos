import { commissionRepository } from './commission.repository.js';
import { Commission } from './commission.model.js';
import { NotFoundError } from '../../core/errors/NotFoundError.js';
import { AppError } from '../../core/errors/AppError.js';
import { audit } from '../audit/audit.service.js';
import { notify } from '../notifications/notification.service.js';

const VALID_TRANSITIONS = {
  CALCULADA: ['APROBADA', 'ANULADA'],
  APROBADA: ['PAGADA', 'ANULADA'],
  PAGADA: [],
  ANULADA: [],
};

export const commissionService = {
  async listCommissions(query) {
    return commissionRepository.findAll(query);
  },

  async getCommissionById(id) {
    const com = await commissionRepository.findById(id);
    if (!com || !com.active) throw new NotFoundError('Comisión no encontrada');
    return com;
  },

  async createCommission(data, requestingUser, req) {
    const com = await commissionRepository.create({ ...data, createdBy: requestingUser.id });

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'commissions',
      action: 'CREATE',
      entityId: com._id,
      after: { number: com.number, amount: com.amount, beneficiaryType: com.beneficiaryType },
      req,
    });

    return com;
  },

  async updateCommission(id, data, requestingUser, req) {
    const com = await commissionRepository.findById(id);
    if (!com || !com.active) throw new NotFoundError('Comisión no encontrada');
    if (com.status !== 'CALCULADA') {
      throw new AppError('Solo se pueden editar comisiones en estado Calculada', 409, 'INVALID_STATE');
    }

    const before = { baseAmount: com.baseAmount, rate: com.rate, amount: com.amount };
    const updated = await commissionRepository.update(id, data);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'commissions',
      action: 'UPDATE',
      entityId: id,
      before,
      after: { baseAmount: updated.baseAmount, rate: updated.rate, amount: updated.amount },
      req,
    });

    return updated;
  },

  async changeStatus(id, newStatus, requestingUser, req) {
    const com = await commissionRepository.findById(id);
    if (!com || !com.active) throw new NotFoundError('Comisión no encontrada');

    const allowed = VALID_TRANSITIONS[com.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new AppError(
        `No se puede cambiar de ${com.status} a ${newStatus}`,
        409,
        'INVALID_TRANSITION'
      );
    }

    const before = { status: com.status };
    const updated = await commissionRepository.changeStatus(id, newStatus, requestingUser.id);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'commissions',
      action: 'UPDATE',
      entityId: id,
      before,
      after: { status: newStatus },
      req,
    });

    if (newStatus === 'APROBADA' && com.beneficiaryId) {
      await notify({
        userId: com.beneficiaryId._id || com.beneficiaryId,
        type: 'COMMISSION_APPROVED',
        title: 'Comisión aprobada',
        message: `Tu comisión ${com.number} ha sido aprobada.`,
        actionUrl: '/comisiones',
      });
    }
    if (newStatus === 'PAGADA' && com.beneficiaryId) {
      await notify({
        userId: com.beneficiaryId._id || com.beneficiaryId,
        type: 'COMMISSION_PAID',
        title: 'Comisión pagada',
        message: `Tu comisión ${com.number} ha sido pagada.`,
        actionUrl: '/comisiones',
      });
    }

    return updated;
  },

  async autoCreateForEvent(eventId, ownerId) {
    const existing = await Commission.findOne({ eventId, active: true }).lean();
    if (existing) return existing;
    return Commission.create({
      eventId,
      beneficiaryId: ownerId || undefined,
      beneficiaryType: 'EJECUTIVO_COMERCIAL',
      baseAmount: 0,
      rate: 0.03,
      createdBy: ownerId || undefined,
    });
  },

  async deleteCommission(id, requestingUser, req) {
    const com = await commissionRepository.findById(id);
    if (!com || !com.active) throw new NotFoundError('Comisión no encontrada');
    if (com.status === 'PAGADA') {
      throw new AppError('No se puede eliminar una comisión ya pagada', 409, 'INVALID_STATE');
    }

    await commissionRepository.softDelete(id);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'commissions',
      action: 'DELETE',
      entityId: id,
      before: { number: com.number, status: com.status },
      req,
    });
  },
};
