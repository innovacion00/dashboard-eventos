import { quoteRepository } from './quote.repository.js';
import { eventService } from '../events/event.service.js';
import { opportunityRepository } from '../opportunities/opportunity.repository.js';
import { NotFoundError } from '../../core/errors/NotFoundError.js';
import { AppError } from '../../core/errors/AppError.js';
import { ConflictError } from '../../core/errors/ConflictError.js';
import { audit } from '../audit/audit.service.js';
import { sendEmail } from '../notifications/email.service.js';
import { generateQuotePdfBuffer } from './quote-pdf.service.js';
import { logger } from '../../config/logger.js';

async function advanceOpportunity(opportunityId, stage) {
  if (!opportunityId) return;
  try {
    const id = opportunityId._id || opportunityId;
    await opportunityRepository.update(id, { stage });
  } catch (err) {
    logger.error({ err, opportunityId, stage }, 'Error al avanzar etapa de oportunidad');
  }
}

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
    if (data.opportunityId) {
      const existing = await quoteRepository.findByOpportunityId(data.opportunityId);
      if (existing) {
        throw new ConflictError('Esta oportunidad ya tiene una cotización asociada');
      }
    }

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

    await advanceOpportunity(quote.opportunityId, 'COTIZADO');

    return quote;
  },

  async updateQuote(id, data, requestingUser, req) {
    const quote = await quoteRepository.findById(id);
    if (!quote || !quote.active) throw new NotFoundError('Cotización no encontrada');
    if (quote.status !== 'BORRADOR' && quote.status !== 'APROBADA') {
      throw new AppError('Solo se pueden editar cotizaciones en borrador o aprobadas', 409, 'INVALID_STATE');
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

    if (newStatus === 'EN_REVISION') {
      await advanceOpportunity(quote.opportunityId, 'NEGOCIACION');
      sendQuoteToCompany(id).catch(err =>
        logger.error({ err, quoteId: id }, 'Error al enviar cotización por correo a la empresa')
      );
    }

    if (newStatus === 'APROBADA') {
      await advanceOpportunity(quote.opportunityId, 'APROBADO_PENDIENTE_PAGO');
      try {
        await eventService.createFromQuote(quote, requestingUser, req);
      } catch (err) {
        logger.error({ err, quoteId: id }, 'Error al crear evento desde cotización aprobada');
      }
    }

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

async function sendQuoteToCompany(quoteId) {
  const quote = await quoteRepository.findById(quoteId);
  if (!quote) return;

  const companyEmail = quote.companyId?.email;
  const companyName = quote.companyId?.name || 'Cliente';
  if (!companyEmail) {
    logger.warn({ quoteId }, 'La empresa no tiene correo electrónico registrado');
    return;
  }

  const pdfBuffer = await generateQuotePdfBuffer(quote);
  const filename = `${quote.number}.pdf`;

  await sendEmail({
    to: companyEmail,
    subject: `Cotización ${quote.number} — Hotel Windsor House`,
    title: 'Cotización de evento',
    message: `Estimado(a) ${companyName},<br><br>Adjunto encontrará la cotización <strong>${quote.number}</strong> para su revisión.<br><br>Quedamos atentos a sus comentarios.`,
    attachments: [{ filename, content: pdfBuffer, contentType: 'application/pdf' }],
  });
}
