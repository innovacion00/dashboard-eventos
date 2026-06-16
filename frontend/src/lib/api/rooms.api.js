import { api } from './client.js';

export const roomsApi = {
  list: () => api.get('/rooms'),
};
