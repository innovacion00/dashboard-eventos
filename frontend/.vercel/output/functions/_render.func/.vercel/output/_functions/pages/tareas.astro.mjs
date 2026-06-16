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

const tasksApi = {
  list: (params = {}) => api.get('/tasks?' + new URLSearchParams(params)),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.patch(`/tasks/${id}`, data),
  changeStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
};

const PRIORITY_OPTIONS = [
  { value: "ALTA", label: "Alta" },
  { value: "MEDIA", label: "Media" },
  { value: "BAJA", label: "Baja" }
];
function TaskForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    description: initial?.description || "",
    priority: initial?.priority || "MEDIA",
    dueDate: initial?.dueDate ? initial.dueDate.slice(0, 10) : ""
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const validate = () => {
    const err = {};
    if (!form.title.trim()) err.title = "El título es obligatorio";
    setErrors(err);
    return Object.keys(err).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      setApiError("");
      const payload = {
        title: form.title,
        description: form.description || void 0,
        priority: form.priority,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : void 0
      };
      if (initial) {
        await tasksApi.update(initial._id || initial.id, payload);
      } else {
        await tasksApi.create(payload);
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
    /* @__PURE__ */ jsx(Input, { id: "title", label: "Título", value: form.title, onChange: set("title"), error: errors.title, required: true }),
    /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
      /* @__PURE__ */ jsx("label", { className: "input-label", htmlFor: "description", children: "Descripción" }),
      /* @__PURE__ */ jsx("textarea", { id: "description", className: "input-control", rows: 3, value: form.description, onChange: set("description") })
    ] }),
    /* @__PURE__ */ jsx(Select, { id: "priority", label: "Prioridad", value: form.priority, onChange: set("priority"), options: PRIORITY_OPTIONS }),
    /* @__PURE__ */ jsx(Input, { id: "dueDate", label: "Fecha de vencimiento", type: "date", value: form.dueDate, onChange: set("dueDate") }),
    /* @__PURE__ */ jsxs("div", { className: "form-actions", children: [
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: onCancel, children: "Cancelar" }),
      /* @__PURE__ */ jsx(Button, { type: "submit", loading, children: initial ? "Guardar cambios" : "Crear tarea" })
    ] })
  ] });
}

const STATUS_LABELS = {
  PENDIENTE: "Pendiente",
  EN_PROGRESO: "En progreso",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
  VENCIDA: "Vencida"
};
const STATUS_VARIANT = {
  PENDIENTE: "badge-neutral",
  EN_PROGRESO: "badge-warning",
  COMPLETADA: "badge-success",
  CANCELADA: "badge-neutral",
  VENCIDA: "badge-danger"
};
const PRIORITY_VARIANT = { ALTA: "badge-danger", MEDIA: "badge-warning", BAJA: "badge-neutral" };
const COLUMNS = [
  { key: "title", label: "Tarea" },
  {
    key: "priority",
    label: "Prioridad",
    render: (r) => /* @__PURE__ */ jsx("span", { className: `badge ${PRIORITY_VARIANT[r.priority]}`, children: r.priority })
  },
  {
    key: "status",
    label: "Estado",
    render: (r) => /* @__PURE__ */ jsx("span", { className: `badge ${STATUS_VARIANT[r.status]}`, children: STATUS_LABELS[r.status] })
  },
  { key: "assigneeId", label: "Asignado", render: (r) => r.assigneeId?.name || "—" },
  { key: "dueDate", label: "Vencimiento", render: (r) => formatDate(r.dueDate) },
  {
    key: "actions",
    label: "",
    width: 160,
    render: (r, onEdit, onStatus) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "var(--space-2)" }, children: [
      /* @__PURE__ */ jsx("button", { className: "link-btn", onClick: () => onEdit(r), children: "Editar" }),
      r.status === "PENDIENTE" && /* @__PURE__ */ jsx("button", { className: "link-btn", onClick: () => onStatus(r._id || r.id, "COMPLETADA"), children: "Completar" })
    ] })
  }
];
function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const load = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await tasksApi.list(params);
      setTasks(res.data);
      setMeta(res.meta);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [statusFilter]);
  const handleChangeStatus = async (id, status) => {
    try {
      await tasksApi.changeStatus(id, status);
      load();
    } catch (e) {
      setError(e.message);
    }
  };
  const columns = COLUMNS.map(
    (col) => col.key === "actions" ? { ...col, render: (r) => col.render(r, (t) => {
      setEditing(t);
      setModal(true);
    }, handleChangeStatus) } : col
  );
  return /* @__PURE__ */ jsxs("div", { className: "page-container", children: [
    /* @__PURE__ */ jsxs("div", { className: "page-header", children: [
      /* @__PURE__ */ jsx("h1", { className: "page-title", children: "Tareas" }),
      /* @__PURE__ */ jsx(Button, { onClick: () => {
        setEditing(null);
        setModal(true);
      }, children: "Nueva tarea" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "page-filters", children: /* @__PURE__ */ jsxs("select", { className: "input-control", value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), style: { maxWidth: 180 }, children: [
      /* @__PURE__ */ jsx("option", { value: "", children: "Todos los estados" }),
      Object.entries(STATUS_LABELS).map(([v, l]) => /* @__PURE__ */ jsx("option", { value: v, children: l }, v))
    ] }) }),
    error && /* @__PURE__ */ jsx(Alert, { type: "error", message: error, onClose: () => setError("") }),
    /* @__PURE__ */ jsx(Table, { columns, rows: tasks, loading, emptyText: "No hay tareas" }),
    meta && /* @__PURE__ */ jsxs("p", { className: "table-meta", children: [
      "Mostrando ",
      tasks.length,
      " de ",
      meta.total
    ] }),
    /* @__PURE__ */ jsx(Modal, { open: modal, title: editing ? "Editar tarea" : "Nueva tarea", onClose: () => setModal(false), children: /* @__PURE__ */ jsx(TaskForm, { initial: editing, onSaved: () => {
      setModal(false);
      load();
    }, onCancel: () => setModal(false) }) })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Tareas" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "TaskList", TaskList, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/components/tasks/TaskList.jsx", "client:component-export": "TaskList" })} ` })}`;
}, "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/tareas/index.astro", void 0);

const $$file = "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/tareas/index.astro";
const $$url = "/tareas";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
