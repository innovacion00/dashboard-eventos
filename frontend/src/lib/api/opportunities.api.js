import { api } from './client.js';

export const opportunitiesApi = {
  list: (params = {}) => api.get('/opportunities?' + new URLSearchParams(params)),
  getById: (id) => api.get(`/opportunities/${id}`),
  create: (data) => api.post('/opportunities', data),
  update: (id, data) => api.patch(`/opportunities/${id}`, data),
  changeStage: (id, stage) => api.patch(`/opportunities/${id}/stage`, { stage }),
  getHistory: (id) => api.get(`/opportunities/${id}/history`),
};
