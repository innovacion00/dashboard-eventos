import { quoteRepository } from './quote.repository.js';
import { NotFoundError } from '../../core/errors/NotFoundError.js';
import { AppError } from '../../core/errors/AppError.js';
import { audit } from '../audit/audit.service.js';

const VALID_TRANSITIONS = {
  BORRADOR: ['EN_REVISION', 'VENCIDA'],
  EN_REVISION: ['APROBADA', 'RECHAZADA', 'BORRADOR', 'VENCIDA'],
  APROBADA: ['VENCIDA'],
  RECHAZADA: ['BORRADOR'],
  VENCIDA: [],
};

export const quoteService = {
  async listQuotes(query) {
    return quoteRepository.findAll(query);
  },

  async getQuoteById(id) {
    const quote = await quoteRepository.findById(id);
    if (!quote || !quote.active) throw new NotFoundError('Cotización no encontrada');
    return quote;
  },

  async createQuote(data, requestingUser, req) {
    const quote = await quoteRepository.create({
      ...data,
      createdBy: requestingUser.id,
    });

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'quotes',
      action: 'CREATE',
      entityId: quote._id,
      after: { number: quote.number, total: quote.total, opportunityId: quote.opportunityId },
      req,
    });

    return quote;
  },

  async updateQuote(id, data, requestingUser, req) {
    const quote = await quoteRepository.findById(id);
    if (!quote || !quote.active) throw new NotFoundError('Cotización no encontrada');
    if (quote.status !== 'BORRADOR') {
      throw new AppError('Solo se pueden editar cotizaciones en borrador', 409, 'INVALID_STATE');
    }

    const before = { total: quote.total, status: quote.status };
    const updated = await quoteRepository.update(id, data);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'quotes',
      action: 'UPDATE',
      entityId: id,
      before,
      after: { total: updated.total },
      req,
    });

    return updated;
  },

  async changeStatus(id, newStatus, requestingUser, req) {
    const quote = await quoteRepository.findById(id);
    if (!quote || !quote.active) throw new NotFoundError('Cotización no encontrada');

    const allowed = VALID_TRANSITIONS[quote.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new AppError(
        `No se puede cambiar de ${quote.status} a ${newStatus}`,
        409,
        'INVALID_TRANSITION'
      );
    }

    const before = { status: quote.status };
    await quoteRepository.changeStatus(id, newStatus, requestingUser.id);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'quotes',
      action: 'UPDATE',
      entityId: id,
      before,
      after: { status: newStatus },
      req,
    });

    return quoteRepository.findById(id);
  },

  async deleteQuote(id, requestingUser, req) {
    const quote = await quoteRepository.findById(id);
    if (!quote || !quote.active) throw new NotFoundError('Cotización no encontrada');
    if (quote.status === 'APROBADA') {
      throw new AppError('No se puede eliminar una cotización aprobada', 409, 'INVALID_STATE');
    }

    await quoteRepository.softDelete(id);
    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'quotes',
      action: 'DELETE',
      entityId: id,
      before: { number: quote.number, status: quote.status },
      req,
    });
  },
};
