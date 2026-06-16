import { c as createComponent, r as renderComponent, b as renderTemplate } from '../chunks/astro/server_BcKwslGY.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_BCbbW_HH.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { a as api, A as Alert } from '../chunks/Alert_AtUShQUE.mjs';
import { B as Button } from '../chunks/Button_BuSRxPWM.mjs';
import { M as Modal } from '../chunks/Modal_FzQIQuvI.mjs';
import { I as Input } from '../chunks/Input_BTByMfUX.mjs';
import { f as formatCurrency } from '../chunks/format_CTgnmbjx.mjs';
export { renderers } from '../renderers.mjs';

const goalsApi = {
  get: (params = {}) => api.get('/goals?' + new URLSearchParams(params)),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.patch(`/goals/${id}`, data),
};

function GoalForm({ initial, defaultYear, defaultMonth, onSaved, onCancel }) {
  const [form, setForm] = useState({
    year: initial?.year || defaultYear || (/* @__PURE__ */ new Date()).getFullYear(),
    month: initial?.month || defaultMonth || (/* @__PURE__ */ new Date()).getMonth() + 1,
    revenueTarget: initial?.revenueTarget || "",
    eventCountTarget: initial?.eventCountTarget || "",
    averageTicketTarget: initial?.averageTicketTarget || "",
    marginTarget: initial?.marginTarget || "",
    presaleThreshold: initial?.presaleThreshold ?? 60
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const validate = () => {
    const err = {};
    if (!form.revenueTarget) err.revenueTarget = "La meta de ingresos es obligatoria";
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
        year: Number(form.year),
        month: Number(form.month),
        revenueTarget: Number(form.revenueTarget),
        eventCountTarget: form.eventCountTarget ? Number(form.eventCountTarget) : void 0,
        averageTicketTarget: form.averageTicketTarget ? Number(form.averageTicketTarget) : void 0,
        marginTarget: form.marginTarget ? Number(form.marginTarget) : void 0,
        presaleThreshold: Number(form.presaleThreshold)
      };
      if (initial?._id || initial?.id) {
        await goalsApi.update(initial._id || initial.id, payload);
      } else {
        await goalsApi.create(payload);
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
    /* @__PURE__ */ jsx(Input, { id: "revenueTarget", label: "Meta de ingresos (COP)", type: "number", value: form.revenueTarget, onChange: set("revenueTarget"), error: errors.revenueTarget, required: true }),
    /* @__PURE__ */ jsx(Input, { id: "eventCountTarget", label: "Meta de eventos (unidades)", type: "number", value: form.eventCountTarget, onChange: set("eventCountTarget") }),
    /* @__PURE__ */ jsx(Input, { id: "averageTicketTarget", label: "Ticket promedio objetivo (COP)", type: "number", value: form.averageTicketTarget, onChange: set("averageTicketTarget") }),
    /* @__PURE__ */ jsx(Input, { id: "marginTarget", label: "Margen objetivo (%)", type: "number", value: form.marginTarget, onChange: set("marginTarget") }),
    /* @__PURE__ */ jsx(Input, { id: "presaleThreshold", label: "Umbral de preventa (%)", type: "number", value: form.presaleThreshold, onChange: set("presaleThreshold") }),
    /* @__PURE__ */ jsxs("div", { className: "form-actions", children: [
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: onCancel, children: "Cancelar" }),
      /* @__PURE__ */ jsx(Button, { type: "submit", loading, children: initial ? "Guardar cambios" : "Crear meta" })
    ] })
  ] });
}

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
function GoalView() {
  const now = /* @__PURE__ */ new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const load = async () => {
    try {
      setLoading(true);
      const res = await goalsApi.get({ year, month });
      setGoal(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [year, month]);
  return /* @__PURE__ */ jsxs("div", { className: "page-container", children: [
    /* @__PURE__ */ jsxs("div", { className: "page-header", children: [
      /* @__PURE__ */ jsx("h1", { className: "page-title", children: "Metas comerciales" }),
      /* @__PURE__ */ jsx(Button, { onClick: () => setModal(goal ? "edit" : "new"), children: goal ? "Editar meta" : "Crear meta" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "page-filters", children: [
      /* @__PURE__ */ jsx("select", { className: "input-control", value: year, onChange: (e) => setYear(Number(e.target.value)), style: { maxWidth: 100 }, children: [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => /* @__PURE__ */ jsx("option", { value: y, children: y }, y)) }),
      /* @__PURE__ */ jsx("select", { className: "input-control", value: month, onChange: (e) => setMonth(Number(e.target.value)), style: { maxWidth: 140 }, children: MONTHS.map((m, i) => /* @__PURE__ */ jsx("option", { value: i + 1, children: m }, i + 1)) })
    ] }),
    error && /* @__PURE__ */ jsx(Alert, { type: "error", message: error, onClose: () => setError("") }),
    loading ? /* @__PURE__ */ jsx("p", { className: "text-muted", children: "Cargando..." }) : goal ? /* @__PURE__ */ jsxs("div", { className: "detail-grid", children: [
      /* @__PURE__ */ jsx(InfoRow, { label: "Mes", value: `${MONTHS[month - 1]} ${year}` }),
      /* @__PURE__ */ jsx(InfoRow, { label: "Meta de ingresos", value: formatCurrency(goal.revenueTarget) }),
      /* @__PURE__ */ jsx(InfoRow, { label: "Meta de eventos", value: goal.eventCountTarget }),
      /* @__PURE__ */ jsx(InfoRow, { label: "Ticket promedio objetivo", value: formatCurrency(goal.averageTicketTarget) }),
      /* @__PURE__ */ jsx(InfoRow, { label: "Margen objetivo", value: goal.marginTarget != null ? `${goal.marginTarget}%` : "—" }),
      /* @__PURE__ */ jsx(InfoRow, { label: "Umbral de preventa", value: `${goal.presaleThreshold}%` })
    ] }) : /* @__PURE__ */ jsxs("p", { className: "text-muted", children: [
      "No hay meta definida para ",
      MONTHS[month - 1],
      " ",
      year,
      "."
    ] }),
    /* @__PURE__ */ jsx(Modal, { open: modal === "new" || modal === "edit", title: modal === "edit" ? "Editar meta" : "Nueva meta", onClose: () => setModal(null), size: "sm", children: /* @__PURE__ */ jsx(
      GoalForm,
      {
        initial: goal,
        defaultYear: year,
        defaultMonth: month,
        onSaved: () => {
          setModal(null);
          load();
        },
        onCancel: () => setModal(null)
      }
    ) })
  ] });
}
function InfoRow({ label, value }) {
  return /* @__PURE__ */ jsxs("div", { className: "info-row", children: [
    /* @__PURE__ */ jsx("span", { className: "info-label", children: label }),
    /* @__PURE__ */ jsx("span", { className: "info-value", children: value ?? "—" })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Metas" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "GoalView", GoalView, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/components/goals/GoalView.jsx", "client:component-export": "GoalView" })} ` })}`;
}, "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/metas/index.astro", void 0);

const $$file = "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/metas/index.astro";
const $$url = "/metas";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
