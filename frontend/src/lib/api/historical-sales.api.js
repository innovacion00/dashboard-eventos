import { api } from './client.js';

export const historicalSalesApi = {
  list: (params = {}) => api.get('/historical-sales?' + new URLSearchParams(params)),
  summary: (year) => api.get(`/historical-sales/summary/${year}`),
  create: (data) => api.post('/historical-sales', data),
  update: (id, data) => api.patch(`/historical-sales/${id}`, data),
  remove: (id) => api.delete(`/historical-sales/${id}`),
};
