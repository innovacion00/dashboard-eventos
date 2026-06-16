import { api } from './client.js';

export const commissionsApi = {
  list: (params = {}) => api.get('/commissions', params),
  getById: (id) => api.get(`/commissions/${id}`),
  create: (data) => api.post('/commissions', data),
  update: (id, data) => api.patch(`/commissions/${id}`, data),
  changeStatus: (id, status) => api.patch(`/commissions/${id}/status`, { status }),
  remove: (id) => api.delete(`/commissions/${id}`),
};
