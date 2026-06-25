import { api } from './client.js';

export const planningApi = {
  getOccupations: (params = {}) => api.get('/planning?' + new URLSearchParams(params)),
};
