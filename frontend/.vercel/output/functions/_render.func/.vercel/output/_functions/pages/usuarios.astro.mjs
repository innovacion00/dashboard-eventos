import { c as createComponent, r as renderComponent, b as renderTemplate } from '../chunks/astro/server_BcKwslGY.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_BCbbW_HH.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { a as api, A as Alert } from '../chunks/Alert_AtUShQUE.mjs';
import { T as Table } from '../chunks/Table_DlC02kRM.mjs';
import { B as Button } from '../chunks/Button_BuSRxPWM.mjs';
import { M as Modal } from '../chunks/Modal_FzQIQuvI.mjs';
import { I as Input } from '../chunks/Input_BTByMfUX.mjs';
import { S as Select } from '../chunks/Select_D-st_0vo.mjs';
import { b as formatDate } from '../chunks/format_CTgnmbjx.mjs';
export { renderers } from '../renderers.mjs';

const usersApi = {
  list: (params = {}) => api.get('/users?' + new URLSearchParams(params)),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.patch(`/users/${id}`, data),
};

const ROLE_OPTIONS = [
  { value: "DIRECCION_GENERAL", label: "Dirección General" },
  { value: "GERENCIA_HOTEL", label: "Gerencia Hotel" },
  { value: "LIDER_COMERCIAL", label: "Líder Comercial" },
  { value: "EJECUTIVO_COMERCIAL", label: "Ejecutivo Comercial" },
  { value: "COORDINACION_OPERATIVA", label: "Coord. Operativa" },
  { value: "FINANCIERO", label: "Financiero" },
  { value: "CALIDAD", label: "Calidad" },
  { value: "ADMINISTRADOR", label: "Administrador" }
];
const STATUS_OPTIONS = [
  { value: "ACTIVO", label: "Activo" },
  { value: "INACTIVO", label: "Inactivo" },
  { value: "SUSPENDIDO", label: "Suspendido" }
];
function UserForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    email: initial?.email || "",
    password: "",
    role: initial?.role || "",
    status: initial?.status || "ACTIVO"
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = "El nombre es obligatorio";
    if (!form.email.trim()) err.email = "El correo es obligatorio";
    if (!initial && !form.password) err.password = "La contraseña es obligatoria";
    if (!form.role) err.role = "El rol es obligatorio";
    setErrors(err);
    return Object.keys(err).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      setApiError("");
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (initial) {
        await usersApi.update(initial.id, payload);
      } else {
        await usersApi.create(payload);
      }
      onSaved();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, noValidate: true, children: [
    apiError && /* @__PURE__ */ jsx(Alert, { type: "error", message: apiError, onClose: () => setApiError("") }),
    /* @__PURE__ */ jsx(Input, { id: "name", label: "Nombre completo", value: form.name, onChange: set("name"), error: errors.name, required: true }),
    /* @__PURE__ */ jsx(Input, { id: "email", label: "Correo electrónico", type: "email", value: form.email, onChange: set("email"), error: errors.email, required: true }),
    /* @__PURE__ */ jsx(
      Input,
      {
        id: "password",
        label: initial ? "Nueva contraseña (dejar vacío para no cambiar)" : "Contraseña",
        type: "password",
        value: form.password,
        onChange: set("password"),
        error: errors.password,
        required: !initial
      }
    ),
    /* @__PURE__ */ jsx(Select, { id: "role", label: "Rol", value: form.role, onChange: set("role"), options: ROLE_OPTIONS, placeholder: "Selecciona un rol", error: errors.role, required: true }),
    initial && /* @__PURE__ */ jsx(Select, { id: "status", label: "Estado", value: form.status, onChange: set("status"), options: STATUS_OPTIONS }),
    /* @__PURE__ */ jsxs("div", { className: "form-actions", children: [
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: onCancel, children: "Cancelar" }),
      /* @__PURE__ */ jsx(Button, { type: "submit", loading, children: initial ? "Guardar cambios" : "Crear usuario" })
    ] })
  ] });
}

const ROLE_LABELS = {
  DIRECCION_GENERAL: "Dirección General",
  GERENCIA_HOTEL: "Gerencia Hotel",
  LIDER_COMERCIAL: "Líder Comercial",
  EJECUTIVO_COMERCIAL: "Ejecutivo Comercial",
  COORDINACION_OPERATIVA: "Coord. Operativa",
  FINANCIERO: "Financiero",
  CALIDAD: "Calidad",
  ADMINISTRADOR: "Administrador"
};
const STATUS_LABELS = { ACTIVO: "Activo", INACTIVO: "Inactivo", SUSPENDIDO: "Suspendido" };
const COLUMNS = [
  { key: "name", label: "Nombre" },
  { key: "email", label: "Correo" },
  { key: "role", label: "Rol", render: (r) => ROLE_LABELS[r.role] || r.role },
  { key: "status", label: "Estado", render: (r) => /* @__PURE__ */ jsx(StatusBadge, { status: r.status }) },
  { key: "lastLoginAt", label: "Último acceso", render: (r) => formatDate(r.lastLoginAt) },
  {
    key: "actions",
    label: "",
    width: 80,
    render: (r, onEdit) => /* @__PURE__ */ jsx("button", { className: "link-btn", onClick: () => onEdit(r), children: "Editar" })
  }
];
function StatusBadge({ status }) {
  const classes = { ACTIVO: "badge-success", INACTIVO: "badge-neutral", SUSPENDIDO: "badge-danger" };
  return /* @__PURE__ */ jsx("span", { className: `badge ${classes[status] || ""}`, children: STATUS_LABELS[status] || status });
}
function UserList() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const load = async () => {
    try {
      setLoading(true);
      const res = await usersApi.list();
      setUsers(res.data);
      setMeta(res.meta);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const handleEdit = (user) => {
    setEditing(user);
    setShowModal(true);
  };
  const handleNew = () => {
    setEditing(null);
    setShowModal(true);
  };
  const handleSaved = () => {
    setShowModal(false);
    load();
  };
  const columnsWithActions = COLUMNS.map(
    (col) => col.key === "actions" ? { ...col, render: (r) => col.render(r, handleEdit) } : col
  );
  return /* @__PURE__ */ jsxs("div", { className: "page-container", children: [
    /* @__PURE__ */ jsxs("div", { className: "page-header", children: [
      /* @__PURE__ */ jsx("h1", { className: "page-title", children: "Usuarios" }),
      /* @__PURE__ */ jsx(Button, { onClick: handleNew, children: "Nuevo usuario" })
    ] }),
    error && /* @__PURE__ */ jsx(Alert, { type: "error", message: error, onClose: () => setError("") }),
    /* @__PURE__ */ jsx(Table, { columns: columnsWithActions, rows: users, loading, emptyText: "No hay usuarios registrados" }),
    meta && /* @__PURE__ */ jsxs("p", { className: "table-meta", children: [
      "Mostrando ",
      users.length,
      " de ",
      meta.total,
      " usuarios"
    ] }),
    /* @__PURE__ */ jsx(Modal, { open: showModal, title: editing ? "Editar usuario" : "Nuevo usuario", onClose: () => setShowModal(false), children: /* @__PURE__ */ jsx(UserForm, { initial: editing, onSaved: handleSaved, onCancel: () => setShowModal(false) }) })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Usuarios" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "UserList", UserList, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/components/users/UserList.jsx", "client:component-export": "UserList" })} ` })}`;
}, "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/usuarios/index.astro", void 0);

const $$file = "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/usuarios/index.astro";
const $$url = "/usuarios";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
