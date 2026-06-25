import { Quote } from '../quotes/quote.model.js';
import { Event } from '../events/event.model.js';

export const planningService = {
  async getOccupations({ roomId, startDate, endDate }) {
    const start = new Date(startDate + 'T00:00:00.000Z');
    const end = new Date(endDate + 'T23:59:59.999Z');
    const dateFilter = {
      eventDate: { $gte: start, $lte: end },
      active: true,
    };

    if (roomId) dateFilter.roomId = roomId;

    const [quotes, events] = await Promise.all([
      Quote.find({
        ...dateFilter,
        status: { $nin: ['RECHAZADA', 'VENCIDA'] },
      })
        .populate('companyId', 'name')
        .populate('roomId', 'name')
        .select('number eventDate eventTime eventType companyId roomId status')
        .lean(),
      Event.find({
        ...dateFilter,
        status: { $nin: ['CANCELADO'] },
      })
        .populate('companyId', 'name')
        .populate('roomId', 'name')
        .select('number name eventDate startTime endTime eventType companyId roomId status')
        .lean(),
    ]);

    const occupations = [];

    for (const q of quotes) {
      const startTime = q.eventTime || '08:00';
      const endH = Math.min(parseInt(startTime.split(':')[0], 10) + 4, 24);
      occupations.push({
        id: q._id,
        type: 'quote',
        date: q.eventDate,
        startTime,
        endTime: `${String(endH).padStart(2, '0')}:00`,
        company: q.companyId?.name || '—',
        room: q.roomId?.name || '—',
        eventType: q.eventType || '',
        status: q.status,
        number: q.number,
      });
    }

    for (const e of events) {
      occupations.push({
        id: e._id,
        type: 'event',
        date: e.eventDate,
        startTime: e.startTime || '08:00',
        endTime: e.endTime || '23:00',
        company: e.companyId?.name || '—',
        room: e.roomId?.name || '—',
        eventType: e.eventType || '',
        status: e.status,
        number: e.number,
        name: e.name,
      });
    }

    return occupations;
  },
};
