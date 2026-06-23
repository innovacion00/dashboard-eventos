import { api } from './client.js';

export const surveysApi = {
  list: (params = {}) => api.get('/surveys?' + new URLSearchParams(params)),
  getById: (id) => api.get(`/surveys/${id}`),
  create: (data) => api.post('/surveys', data),
  update: (id, data) => api.patch(`/surveys/${id}`, data),
  changeStatus: (id, status) => api.patch(`/surveys/${id}/status`, { status }),
  remove: (id) => api.delete(`/surveys/${id}`),
  getResponses: (id, params = {}) => api.get(`/surveys/${id}/responses?` + new URLSearchParams(params)),
  getNps: (id) => api.get(`/surveys/${id}/nps`),
  getPublicSurvey: (token) => api.get(`/surveys/public/${token}`),
  submitResponse: (token, data) => api.post(`/surveys/public/${token}`, data),
};
