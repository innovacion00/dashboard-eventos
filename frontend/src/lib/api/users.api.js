import { api } from './client.js';

export const usersApi = {
  list: (params = {}) => api.get('/users?' + new URLSearchParams(params)),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.patch(`/users/${id}`, data),
};
