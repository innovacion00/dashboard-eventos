import { a as api } from './Alert_AtUShQUE.mjs';

const invoicesApi = {
  list: (params = {}) => api.get('/invoices', params),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.patch(`/invoices/${id}`, data),
  changeStatus: (id, status) => api.patch(`/invoices/${id}/status`, { status }),
  addPayment: (id, data) => api.post(`/invoices/${id}/payments`, data),
  cancelPayment: (invoiceId, paymentId) => api.delete(`/invoices/${invoiceId}/payments/${paymentId}`),
  remove: (id) => api.delete(`/invoices/${id}`),
};

export { invoicesApi as i };
