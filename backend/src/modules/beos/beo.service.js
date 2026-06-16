import { beoRepository } from './beo.repository.js';
import { NotFoundError } from '../../core/errors/NotFoundError.js';
import { ConflictError } from '../../core/errors/ConflictError.js';
import { AppError } from '../../core/errors/AppError.js';
import { audit } from '../audit/audit.service.js';

export const beoService = {
  async getByEventId(eventId) {
    return beoRepository.findByEventId(eventId);
  },

  async getById(id) {
    const beo = await beoRepository.findById(id);
    if (!beo || !beo.active) throw new NotFoundError('BEO no encontrado');
    return beo;
  },

  async createBeo(data, requestingUser, req) {
    const existing = await beoRepository.findByEventId(data.eventId);
    if (existing) throw new ConflictError('Este evento ya tiene un BEO. Edita el existente.');

    const beo = await beoRepository.create({
      ...data,
      createdBy: requestingUser.id,
    });

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'beos',
      action: 'CREATE',
      entityId: beo._id,
      after: { number: beo.number, eventId: beo.eventId },
      req,
    });

    return beo;
  },

  async updateBeo(id, data, requestingUser, req) {
    const beo = await beoRepository.findById(id);
    if (!beo || !beo.active) throw new NotFoundError('BEO no encontrado');
    if (beo.status === 'CONFIRMADO') {
      throw new AppError('No se puede editar un BEO confirmado', 409, 'INVALID_STATE');
    }

    const updated = await beoRepository.update(id, data);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'beos',
      action: 'UPDATE',
      entityId: id,
      after: { status: updated.status },
      req,
    });

    return updated;
  },

  async changeStatus(id, newStatus, requestingUser, req) {
    const beo = await beoRepository.findById(id);
    if (!beo || !beo.active) throw new NotFoundError('BEO no encontrado');

    if (beo.status === 'CONFIRMADO') {
      throw new AppError('No se puede cambiar el estado de un BEO confirmado', 409, 'INVALID_STATE');
    }

    const before = { status: beo.status };
    const updated = await beoRepository.changeStatus(id, newStatus);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'beos',
      action: 'UPDATE',
      entityId: id,
      before,
      after: { status: newStatus },
      req,
    });

    return updated;
  },
};
