import { api } from './client.js';

export const goalsApi = {
  get: (params = {}) => api.get('/goals?' + new URLSearchParams(params)),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.patch(`/goals/${id}`, data),
  remove: (id) => api.delete(`/goals/${id}`),
};
