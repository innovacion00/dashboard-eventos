import { api } from './client.js';

export const dashboardApi = {
  snapshot: (params = {}) => api.get('/dashboard/snapshot?' + new URLSearchParams(params)),
};
