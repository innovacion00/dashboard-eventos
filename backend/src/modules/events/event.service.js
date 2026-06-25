import { eventRepository } from './event.repository.js';
import { opportunityRepository } from '../opportunities/opportunity.repository.js';
import { NotFoundError } from '../../core/errors/NotFoundError.js';
import { AppError } from '../../core/errors/AppError.js';
import { audit } from '../audit/audit.service.js';
import { notify } from '../notifications/notification.service.js';
import { sendEmail } from '../notifications/email.service.js';
import { beoService } from '../beos/beo.service.js';
import { logger } from '../../config/logger.js';

const SURVEY_URL = 'https://b24-xz8e0u.bitrix24.site/eventos-formulario/';

export const eventService = {
  async listEvents(query) {
    return eventRepository.findAll(query);
  },

  async getEventById(id) {
    const event = await eventRepository.findById(id);
    if (!event || !event.active) throw new NotFoundError('Evento no encontrado');
    return event;
  },

  async createEvent(data, requestingUser, req) {
    const event = await eventRepository.create({
      ...data,
      ownerId: requestingUser.id,
    });

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'events',
      action: 'CREATE',
      entityId: event._id,
      after: { number: event.number, name: event.name, eventDate: event.eventDate },
      req,
    });

    return event;
  },

  // Called automatically when opportunity reaches CONFIRMADO
  async createFromOpportunity(opportunity, requestingUser, req) {
    const existing = await eventRepository.findByOpportunityId(opportunity._id);
    if (existing) return existing;

    const event = await eventRepository.create({
      opportunityId: opportunity._id,
      companyId: opportunity.companyId,
      ownerId: opportunity.ownerId,
      name: opportunity.eventType
        ? `${opportunity.eventType} — ${opportunity.companyId?.name || ''}`
        : `Evento ${opportunity._id}`,
      eventType: opportunity.eventType,
      roomId: opportunity.probableRoomId,
      eventDate: opportunity.estimatedEventDate || new Date(),
      attendees: opportunity.attendees,
      totalValue: opportunity.estimatedValue || 0,
      status: 'CONFIRMADO',
    });

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'events',
      action: 'CREATE',
      entityId: event._id,
      after: {
        number: event.number,
        source: 'auto-from-opportunity',
        opportunityId: opportunity._id,
      },
      req,
    });

    return event;
  },

  async createFromQuote(quote, requestingUser, req) {
    const existing = await eventRepository.findByQuoteId(quote._id);
    if (existing) return existing;

    const companyId = quote.companyId?._id || quote.companyId;
    const roomId = quote.roomId?._id || quote.roomId || undefined;
    const opportunityId = quote.opportunityId?._id || quote.opportunityId || undefined;

    const event = await eventRepository.create({
      quoteId: quote._id,
      opportunityId,
      companyId,
      ownerId: requestingUser.id,
      name: `${quote.eventType || 'Evento'} — ${quote.number}`,
      eventType: quote.eventType,
      roomId,
      eventDate: quote.eventDate || new Date(),
      attendees: quote.attendees,
      totalValue: quote.total || 0,
      status: 'CONFIRMADO',
      notes: quote.notes,
    });

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'events',
      action: 'CREATE',
      entityId: event._id,
      after: { number: event.number, source: 'auto-from-quote', quoteId: quote._id },
      req,
    });

    try {
      await beoService.createFromQuote(quote, event, requestingUser, req);
    } catch (err) {
      logger.error({ err, eventId: event._id }, 'Error al crear BEOs desde cotización aprobada');
    }

    return event;
  },

  async updateEvent(id, data, requestingUser, req) {
    const event = await eventRepository.findById(id);
    if (!event || !event.active) throw new NotFoundError('Evento no encontrado');

    const before = { name: event.name, status: event.status, eventDate: event.eventDate };
    const updated = await eventRepository.update(id, data);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'events',
      action: 'UPDATE',
      entityId: id,
      before,
      after: data,
      req,
    });

    return updated;
  },

  async changeStatus(id, newStatus, requestingUser, req) {
    const event = await eventRepository.findById(id);
    if (!event || !event.active) throw new NotFoundError('Evento no encontrado');

    if (event.status === 'CANCELADO') {
      throw new AppError('No se puede cambiar el estado de un evento cancelado', 409, 'INVALID_STATE');
    }

    const before = { status: event.status };
    await eventRepository.changeStatus(id, newStatus);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'events',
      action: 'UPDATE',
      entityId: id,
      before,
      after: { status: newStatus },
      req,
    });

    if (event.ownerId) {
      await notify({
        userId: event.ownerId._id || event.ownerId,
        type: 'EVENT_STATUS_CHANGED',
        title: 'Estado del evento actualizado',
        message: `El evento ${event.number} cambió a ${newStatus}.`,
        actionUrl: `/eventos/${id}`,
      });
    }

    if ((newStatus === 'REALIZADO' || newStatus === 'CANCELADO') && event.opportunityId) {
      const oppStage = newStatus === 'REALIZADO' ? 'CONFIRMADO' : 'PERDIDO';
      try {
        const oppId = event.opportunityId._id || event.opportunityId;
        await opportunityRepository.update(oppId, { stage: oppStage });
      } catch (err) {
        logger.error({ err, eventId: id }, `Error al cambiar oportunidad a ${oppStage}`);
      }
    }

    if (newStatus === 'REALIZADO') {
      const companyEmail = event.companyId?.email;
      const companyName = event.companyId?.name || 'Cliente';
      if (companyEmail) {
        sendEmail({
          to: companyEmail,
          subject: `¿Cómo fue su experiencia? — ${event.name || event.number}`,
          title: 'Encuesta de satisfacción',
          message: `Estimado(a) ${companyName},<br><br>Esperamos que su evento <strong>${event.name || event.number}</strong> haya sido una excelente experiencia.<br><br>Nos encantaría conocer su opinión. Por favor, dedique unos minutos a completar nuestra encuesta de satisfacción:`,
          actionUrl: SURVEY_URL,
        }).catch(err => logger.error({ err, eventId: id }, 'Error al enviar encuesta post-evento'));
      }
    }

    return eventRepository.findById(id);
  },

  async deleteEvent(id, requestingUser, req) {
    const event = await eventRepository.findById(id);
    if (!event || !event.active) throw new NotFoundError('Evento no encontrado');

    await eventRepository.softDelete(id);
    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'events',
      action: 'DELETE',
      entityId: id,
      before: { number: event.number, name: event.name },
      req,
    });
  },
};
