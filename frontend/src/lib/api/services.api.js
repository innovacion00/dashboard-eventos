import { api } from './client.js';

export const servicesApi = {
  list: (params = {}) => api.get('/services?' + new URLSearchParams(params)),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.patch(`/services/${id}`, data),
  remove: (id) => api.delete(`/services/${id}`),
};
