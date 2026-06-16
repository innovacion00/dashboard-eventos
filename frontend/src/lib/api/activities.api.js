import { api } from './client.js';

export const activitiesApi = {
  list: (params = {}) => api.get('/activities?' + new URLSearchParams(params)),
  create: (data) => api.post('/activities', data),
};
