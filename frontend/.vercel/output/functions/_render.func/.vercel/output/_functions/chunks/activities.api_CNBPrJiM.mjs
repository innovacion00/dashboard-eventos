import { a as api } from './Alert_AtUShQUE.mjs';

const activitiesApi = {
  list: (params = {}) => api.get('/activities?' + new URLSearchParams(params)),
  create: (data) => api.post('/activities', data),
};

export { activitiesApi as a };
