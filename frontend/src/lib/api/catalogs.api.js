import { api } from './client.js';

export const catalogsApi = {
  list: (type) => api.get(`/catalogs?type=${type}`),
};
