import { api } from './client.js';

export const roomsApi = {
  list:   ()        => api.get('/rooms'),
  update: (id, data) => api.patch(`/rooms/${id}`, data),
};
