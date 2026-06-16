import { jsxs, jsx } from 'react/jsx-runtime';
/* empty css                        */

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Sincroniza en cookie para el middleware Astro SSR
  document.cookie = `auth_token=${token}; path=/; SameSite=Lax`;
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

const BASE_URL = "http://localhost:4000/api/v1";
class ApiError extends Error {
  constructor(error) {
    super(error?.message || "Error desconocido");
    this.code = error?.code;
    this.details = error?.details;
  }
}
async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...token && { Authorization: `Bearer ${token}` },
    ...options.headers
  };
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (res.status === 401) {
    clearSession();
    window.location.href = "/login";
    return;
  }
  const json = await res.json();
  if (!res.ok) {
    throw new ApiError(json.error);
  }
  return json;
}
const api = {
  get: (path, options) => apiFetch(path, { method: "GET", ...options }),
  post: (path, body, options) => apiFetch(path, { method: "POST", body: JSON.stringify(body), ...options }),
  patch: (path, body, options) => apiFetch(path, { method: "PATCH", body: JSON.stringify(body), ...options }),
  delete: (path, options) => apiFetch(path, { method: "DELETE", ...options })
};

function Alert({ children, variant = "info", onClose }) {
  return /* @__PURE__ */ jsxs("div", { className: `alert alert--${variant}`, role: "alert", children: [
    /* @__PURE__ */ jsx("span", { className: "alert-content", children }),
    onClose && /* @__PURE__ */ jsx("button", { type: "button", className: "alert-close", onClick: onClose, "aria-label": "Cerrar", children: "×" })
  ] });
}

export { Alert as A, api as a, saveSession as s };
