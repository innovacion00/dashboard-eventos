import { api } from './client.js';

export const beosApi = {
  getByEvent: (eventId) => api.get(`/beos/event/${eventId}`),
  create: (data) => api.post('/beos', data),
  update: (id, data) => api.patch(`/beos/${id}`, data),
  changeStatus: (id, status) => api.patch(`/beos/${id}/status`, { status }),
};
