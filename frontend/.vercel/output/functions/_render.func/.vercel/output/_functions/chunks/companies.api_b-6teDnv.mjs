import { a as api } from './Alert_AtUShQUE.mjs';

const companiesApi = {
  list: (params = {}) => api.get('/companies?' + new URLSearchParams(params)),
  getById: (id) => api.get(`/companies/${id}`),
  create: (data) => api.post('/companies', data),
  update: (id, data) => api.patch(`/companies/${id}`, data),
  remove: (id) => api.delete(`/companies/${id}`),
  importCompanies: (companies) => api.post('/companies/import', { companies }),
  listContacts: (id, params = {}) => api.get(`/companies/${id}/contacts?` + new URLSearchParams(params)),
  listActivities: (id, params = {}) => api.get(`/companies/${id}/activities?` + new URLSearchParams(params)),
  listOpportunities: (id, params = {}) => api.get(`/companies/${id}/opportunities?` + new URLSearchParams(params)),
};

export { companiesApi as c };
