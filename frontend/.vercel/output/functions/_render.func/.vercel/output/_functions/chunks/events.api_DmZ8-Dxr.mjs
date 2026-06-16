import { a as api } from './Alert_AtUShQUE.mjs';

const eventsApi = {
  list: (params = {}) => api.get('/events?' + new URLSearchParams(params)),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.patch(`/events/${id}`, data),
  changeStatus: (id, status) => api.patch(`/events/${id}/status`, { status }),
  remove: (id) => api.delete(`/events/${id}`),
};

export { eventsApi };
