import { eventRepository } from './event.repository.js';
import { NotFoundError } from '../../core/errors/NotFoundError.js';
import { AppError } from '../../core/errors/AppError.js';
import { audit } from '../audit/audit.service.js';

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
