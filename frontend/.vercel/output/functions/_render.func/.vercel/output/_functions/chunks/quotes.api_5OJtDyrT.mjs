import { a as api } from './Alert_AtUShQUE.mjs';

const quotesApi = {
  list: (params = {}) => api.get('/quotes?' + new URLSearchParams(params)),
  getById: (id) => api.get(`/quotes/${id}`),
  create: (data) => api.post('/quotes', data),
  update: (id, data) => api.patch(`/quotes/${id}`, data),
  changeStatus: (id, status) => api.patch(`/quotes/${id}/status`, { status }),
  remove: (id) => api.delete(`/quotes/${id}`),
};

export { quotesApi as q };
