import { api } from './client.js';

export const vendorsApi = {
  list: (params = {}) => api.get('/vendors?' + new URLSearchParams(params)),
  getById: (id) => api.get(`/vendors/${id}`),
  create: (data) => api.post('/vendors', data),
  update: (id, data) => api.patch(`/vendors/${id}`, data),
  remove: (id) => api.delete(`/vendors/${id}`),
};
