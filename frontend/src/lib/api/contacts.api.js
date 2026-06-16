import { api } from './client.js';

export const contactsApi = {
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.patch(`/contacts/${id}`, data),
  remove: (id) => api.delete(`/contacts/${id}`),
};
