import { api } from './client.js';

export const tasksApi = {
  list: (params = {}) => api.get('/tasks?' + new URLSearchParams(params)),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.patch(`/tasks/${id}`, data),
  changeStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
};
