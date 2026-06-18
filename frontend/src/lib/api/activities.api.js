import { api } from './client.js';

export const activitiesApi = {
  list: (params = {}) => api.get('/activities?' + new URLSearchParams(params)),

  create: (data, files = []) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') fd.append(k, v);
    });
    files.forEach((f) => fd.append('attachments', f));
    return api.postForm('/activities', fd);
  },
};
