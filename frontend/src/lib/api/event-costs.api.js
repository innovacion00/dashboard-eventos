import { api } from './client.js';

export const eventCostsApi = {
  listByEvent: (eventId) => api.get(`/event-costs/event/${eventId}`),
  getSummary: (eventId, revenue = 0) => api.get(`/event-costs/event/${eventId}/summary`, { revenue }),
  getProfitBreakdown: (eventId) => api.get(`/event-costs/event/${eventId}/profit-breakdown`),
  create: (data) => api.post('/event-costs', data),
  update: (id, data) => api.patch(`/event-costs/${id}`, data),
  remove: (id) => api.delete(`/event-costs/${id}`),
};
