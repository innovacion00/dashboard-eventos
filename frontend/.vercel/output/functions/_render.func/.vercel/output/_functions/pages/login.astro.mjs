import { c as createComponent, e as renderHead, r as renderComponent, b as renderTemplate } from '../chunks/astro/server_BcKwslGY.mjs';
import 'kleur/colors';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
import { I as Input } from '../chunks/Input_BTByMfUX.mjs';
import { B as Button } from '../chunks/Button_BuSRxPWM.mjs';
import { a as api, A as Alert, s as saveSession } from '../chunks/Alert_AtUShQUE.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout', {}),
  me: () => api.get('/auth/me'),
};

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      saveSession(res.data.token, res.data.user);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.message || "Error al iniciar sesión. Verifica tus credenciales.");
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxs("form", { className: "login-form", onSubmit: handleSubmit, noValidate: true, children: [
    /* @__PURE__ */ jsxs("div", { className: "login-form-header", children: [
      /* @__PURE__ */ jsx("div", { className: "login-form-logo", children: "◈" }),
      /* @__PURE__ */ jsx("h1", { className: "login-form-title", children: "GEH Events" }),
      /* @__PURE__ */ jsx("p", { className: "login-form-subtitle", children: "Sistema de Gestión Comercial — Hotel Windsor House" })
    ] }),
    error && /* @__PURE__ */ jsx(Alert, { variant: "danger", onClose: () => setError(null), children: error }),
    /* @__PURE__ */ jsxs("div", { className: "login-form-fields", children: [
      /* @__PURE__ */ jsx(
        Input,
        {
          id: "email",
          label: "Correo electrónico",
          type: "email",
          value: email,
          onChange: (e) => setEmail(e.target.value),
          placeholder: "usuario@gehsuites.com",
          required: true,
          autoComplete: "email",
          autoFocus: true
        }
      ),
      /* @__PURE__ */ jsx(
        Input,
        {
          id: "password",
          label: "Contraseña",
          type: "password",
          value: password,
          onChange: (e) => setPassword(e.target.value),
          placeholder: "••••••••",
          required: true,
          autoComplete: "current-password"
        }
      )
    ] }),
    /* @__PURE__ */ jsx(Button, { type: "submit", size: "lg", loading, style: { width: "100%" }, children: "Iniciar sesión" })
  ] });
}

const $$Login = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="es"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Iniciar sesión | GEH Events</title><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">${renderHead()}</head> <body> <main class="login-page"> ${renderComponent($$result, "LoginForm", LoginForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/components/auth/LoginForm.jsx", "client:component-export": "LoginForm" })} </main> </body></html>`;
}, "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/login.astro", void 0);

const $$file = "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
