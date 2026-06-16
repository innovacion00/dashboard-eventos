import { c as createComponent, r as renderComponent, b as renderTemplate } from '../chunks/astro/server_BcKwslGY.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_BCbbW_HH.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { a as api, A as Alert } from '../chunks/Alert_AtUShQUE.mjs';
import { f as formatCurrency } from '../chunks/format_CTgnmbjx.mjs';
export { renderers } from '../renderers.mjs';

const commissionsApi = {
  list: (params = {}) => api.get('/commissions', params),
  getById: (id) => api.get(`/commissions/${id}`),
  create: (data) => api.post('/commissions', data),
  update: (id, data) => api.patch(`/commissions/${id}`, data),
  changeStatus: (id, status) => api.patch(`/commissions/${id}/status`, { status }),
  remove: (id) => api.delete(`/commissions/${id}`),
};

const STATUS_LABEL = { CALCULADA: "Calculada", APROBADA: "Aprobada", PAGADA: "Pagada", ANULADA: "Anulada" };
const STATUS_VARIANT = { CALCULADA: "neutral", APROBADA: "warning", PAGADA: "success", ANULADA: "danger" };
const STATUSES = Object.keys(STATUS_LABEL);
const NEXT = { CALCULADA: "APROBADA", APROBADA: "PAGADA" };
function CommissionList() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await commissionsApi.list({ status: statusFilter || void 0 });
      setItems(res.data || []);
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
  const handleAdvance = async (id, newStatus) => {
    try {
      await commissionsApi.changeStatus(id, newStatus);
      load();
    } catch (e) {
      setError(e.message);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "page-container", children: [
    /* @__PURE__ */ jsxs("div", { className: "page-header", children: [
      /* @__PURE__ */ jsx("h1", { className: "page-title", children: "Comisiones" }),
      /* @__PURE__ */ jsx("button", { className: "btn btn-primary", onClick: () => setShowForm(true), children: "Nueva comisión" })
    ] }),
    error && /* @__PURE__ */ jsx(Alert, { type: "error", message: error, onClose: () => setError("") }),
    showForm && /* @__PURE__ */ jsx(CommissionForm, { onSaved: () => {
      setShowForm(false);
      load();
    }, onCancel: () => setShowForm(false) }),
    /* @__PURE__ */ jsx("div", { className: "page-filters", children: /* @__PURE__ */ jsxs("select", { className: "filter-select", value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), children: [
      /* @__PURE__ */ jsx("option", { value: "", children: "Todos los estados" }),
      STATUSES.map((s) => /* @__PURE__ */ jsx("option", { value: s, children: STATUS_LABEL[s] }, s))
    ] }) }),
    loading ? /* @__PURE__ */ jsx("p", { className: "text-muted", children: "Cargando..." }) : items.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-muted", children: "No hay comisiones registradas." }) : /* @__PURE__ */ jsxs("table", { className: "table", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { children: "Número" }),
        /* @__PURE__ */ jsx("th", { children: "Evento" }),
        /* @__PURE__ */ jsx("th", { children: "Beneficiario" }),
        /* @__PURE__ */ jsx("th", { children: "Tipo" }),
        /* @__PURE__ */ jsx("th", { children: "Base" }),
        /* @__PURE__ */ jsx("th", { children: "Tasa" }),
        /* @__PURE__ */ jsx("th", { children: "Comisión" }),
        /* @__PURE__ */ jsx("th", { children: "Estado" }),
        /* @__PURE__ */ jsx("th", {})
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: items.map((c) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("strong", { children: c.number }) }),
        /* @__PURE__ */ jsx("td", { children: c.event?.number || "—" }),
        /* @__PURE__ */ jsx("td", { children: c.beneficiary?.name || c.beneficiaryName || "—" }),
        /* @__PURE__ */ jsx("td", { children: c.beneficiaryType?.replace("_", " ") }),
        /* @__PURE__ */ jsx("td", { children: formatCurrency(c.baseAmount) }),
        /* @__PURE__ */ jsxs("td", { children: [
          (c.rate * 100).toFixed(1),
          "%"
        ] }),
        /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("strong", { children: formatCurrency(c.amount) }) }),
        /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", { className: `badge badge-${STATUS_VARIANT[c.status]}`, children: STATUS_LABEL[c.status] }) }),
        /* @__PURE__ */ jsx("td", { children: NEXT[c.status] && /* @__PURE__ */ jsxs("button", { className: "link-btn", onClick: () => handleAdvance(c.id, NEXT[c.status]), children: [
          "→ ",
          STATUS_LABEL[NEXT[c.status]]
        ] }) })
      ] }, c.id)) })
    ] }),
    meta && /* @__PURE__ */ jsxs("p", { className: "text-muted", style: { fontSize: "var(--text-xs)", marginTop: "var(--space-3)" }, children: [
      meta.total,
      " registro(s)"
    ] })
  ] });
}
const BENEFICIARY_TYPES = ["EJECUTIVO_COMERCIAL", "FREELANCE", "ALIADO", "AGENCIA", "OTRO"];
function CommissionForm({ onSaved, onCancel }) {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    eventId: "",
    beneficiaryName: "",
    beneficiaryType: "EJECUTIVO_COMERCIAL",
    baseAmount: "",
    rate: "0.05",
    notes: ""
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    import('../chunks/events.api_DmZ8-Dxr.mjs').then(
      ({ eventsApi }) => eventsApi.list({ limit: 200 }).then((r) => setEvents(r.data || []))
    ).catch(() => {
    });
  }, []);
  const computed = Math.round((parseFloat(form.baseAmount) || 0) * (parseFloat(form.rate) || 0) * 100) / 100;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await commissionsApi.create({
        eventId: form.eventId,
        beneficiaryName: form.beneficiaryName,
        beneficiaryType: form.beneficiaryType,
        baseAmount: parseFloat(form.baseAmount),
        rate: parseFloat(form.rate),
        notes: form.notes || void 0
      });
      onSaved();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { style: { background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "var(--space-4)", marginBottom: "var(--space-4)" }, children: [
    /* @__PURE__ */ jsx("h3", { style: { margin: "0 0 var(--space-4)" }, children: "Nueva comisión" }),
    error && /* @__PURE__ */ jsx(Alert, { type: "error", message: error, onClose: () => setError("") }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxs("div", { className: "form-grid-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
          /* @__PURE__ */ jsxs("label", { className: "input-label", children: [
            "Evento ",
            /* @__PURE__ */ jsx("span", { className: "input-required", children: "*" })
          ] }),
          /* @__PURE__ */ jsxs("select", { className: "select-field", value: form.eventId, onChange: (e) => setForm((f) => ({ ...f, eventId: e.target.value })), required: true, children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Seleccionar evento" }),
            events.map((ev) => /* @__PURE__ */ jsxs("option", { value: ev.id, children: [
              ev.number,
              " — ",
              ev.name
            ] }, ev.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
          /* @__PURE__ */ jsx("label", { className: "input-label", children: "Tipo de beneficiario" }),
          /* @__PURE__ */ jsx("select", { className: "select-field", value: form.beneficiaryType, onChange: (e) => setForm((f) => ({ ...f, beneficiaryType: e.target.value })), children: BENEFICIARY_TYPES.map((t) => /* @__PURE__ */ jsx("option", { value: t, children: t.replace("_", " ") }, t)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
          /* @__PURE__ */ jsx("label", { className: "input-label", children: "Nombre beneficiario" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: "input",
              type: "text",
              value: form.beneficiaryName,
              onChange: (e) => setForm((f) => ({ ...f, beneficiaryName: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
          /* @__PURE__ */ jsxs("label", { className: "input-label", children: [
            "Monto base ",
            /* @__PURE__ */ jsx("span", { className: "input-required", children: "*" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: "input",
              type: "number",
              min: "0",
              step: "0.01",
              value: form.baseAmount,
              onChange: (e) => setForm((f) => ({ ...f, baseAmount: e.target.value })),
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
          /* @__PURE__ */ jsxs("label", { className: "input-label", children: [
            "Tasa (%) ",
            /* @__PURE__ */ jsx("span", { className: "input-required", children: "*" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: "input",
              type: "number",
              min: "0",
              max: "100",
              step: "0.1",
              value: (parseFloat(form.rate) * 100).toFixed(1),
              onChange: (e) => setForm((f) => ({ ...f, rate: String(parseFloat(e.target.value) / 100) })),
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "input-field", style: { display: "flex", flexDirection: "column", justifyContent: "flex-end" }, children: /* @__PURE__ */ jsxs("p", { style: { margin: 0, fontWeight: "var(--font-bold)", color: "var(--color-gold-dark)" }, children: [
          "Comisión calculada: ",
          formatCurrency(computed)
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
        /* @__PURE__ */ jsx("label", { className: "input-label", children: "Notas" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            className: "input",
            rows: 2,
            value: form.notes,
            onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value }))
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-actions", children: [
        /* @__PURE__ */ jsx("button", { type: "button", className: "btn btn-secondary", onClick: onCancel, children: "Cancelar" }),
        /* @__PURE__ */ jsx("button", { type: "submit", className: "btn btn-primary", disabled: saving, children: saving ? "Guardando..." : "Crear" })
      ] })
    ] })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Comisiones" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "CommissionList", CommissionList, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/components/commissions/CommissionList.jsx", "client:component-export": "CommissionList" })} ` })}`;
}, "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/comisiones/index.astro", void 0);

const $$file = "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/comisiones/index.astro";
const $$url = "/comisiones";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
