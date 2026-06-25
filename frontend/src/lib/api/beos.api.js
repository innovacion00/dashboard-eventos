import { api } from './client.js';

export const beosApi = {
  getByEvent: (eventId) => api.get(`/beos/event/${eventId}`),
  create: (data) => api.post('/beos', data),
  update: (id, data) => api.patch(`/beos/${id}`, data),
  changeStatus: (id, status) => api.patch(`/beos/${id}/status`, { status }),
  addPayment: (id, formData) => api.postForm(`/beos/${id}/payments`, formData),
  removePayment: (id, paymentId) => api.delete(`/beos/${id}/payments/${paymentId}`),
  downloadPdf: async (id, filename) => {
    const token = (await import('../auth/session.js')).getToken();
    const base = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const res = await fetch(`${base}/beos/${id}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Error al generar el PDF');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'beo.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};
