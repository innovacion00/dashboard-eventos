import { api } from './client.js';

export const quotesApi = {
  list: (params = {}) => api.get('/quotes?' + new URLSearchParams(params)),
  getById: (id) => api.get(`/quotes/${id}`),
  create: (data) => api.post('/quotes', data),
  update: (id, data) => api.patch(`/quotes/${id}`, data),
  changeStatus: (id, status) => api.patch(`/quotes/${id}/status`, { status }),
  remove: (id) => api.delete(`/quotes/${id}`),
  downloadPdf: async (id, filename) => {
    const token = (await import('../auth/session.js')).getToken();
    const base = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const res = await fetch(`${base}/quotes/${id}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Error al generar el PDF');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'cotizacion.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};
