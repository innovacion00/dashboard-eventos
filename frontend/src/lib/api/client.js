import { getToken, clearSession } from '../auth/session.js';

const BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  constructor(error) {
    super(error?.message || 'Error desconocido');
    this.code = error?.code;
    this.details = error?.details;
  }
}

export async function apiFetch(path, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearSession();
    window.location.href = '/login';
    return;
  }

  const json = await res.json();

  if (!res.ok) {
    throw new ApiError(json.error);
  }

  return json;
}

export const api = {
  get: (path, options) => apiFetch(path, { method: 'GET', ...options }),
  post: (path, body, options) => apiFetch(path, { method: 'POST', body: JSON.stringify(body), ...options }),
  patch: (path, body, options) => apiFetch(path, { method: 'PATCH', body: JSON.stringify(body), ...options }),
  delete: (path, options) => apiFetch(path, { method: 'DELETE', ...options }),
};
