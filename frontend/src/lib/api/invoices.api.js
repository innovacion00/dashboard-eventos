import { api } from './client.js';

export const invoicesApi = {
  list: (params = {}) => {
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''));
    return api.get('/invoices?' + new URLSearchParams(clean));
  },
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.patch(`/invoices/${id}`, data),
  changeStatus: (id, status) => api.patch(`/invoices/${id}/status`, { status }),
  addPayment: (id, formData) => api.postForm(`/invoices/${id}/payments`, formData),
  cancelPayment: (invoiceId, paymentId) => api.delete(`/invoices/${invoiceId}/payments/${paymentId}`),
  remove: (id) => api.delete(`/invoices/${id}`),
  addDocument: (id, formData) => api.postForm(`/invoices/${id}/documents`, formData),
  removeDocument: (id, docId) => api.delete(`/invoices/${id}/documents/${docId}`),
};
