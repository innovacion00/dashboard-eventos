import { c as createComponent, r as renderComponent, b as renderTemplate } from '../chunks/astro/server_BcKwslGY.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_BCbbW_HH.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { a as api, A as Alert } from '../chunks/Alert_AtUShQUE.mjs';
import { T as Table } from '../chunks/Table_DlC02kRM.mjs';
import { B as Button } from '../chunks/Button_BuSRxPWM.mjs';
import { M as Modal } from '../chunks/Modal_FzQIQuvI.mjs';
import { c as companiesApi } from '../chunks/companies.api_b-6teDnv.mjs';
import { c as catalogsApi } from '../chunks/catalogs.api_JwOBjRKW.mjs';
import { r as roomsApi } from '../chunks/rooms.api_DgCTYlBO.mjs';
import { I as Input } from '../chunks/Input_BTByMfUX.mjs';
import { S as Select } from '../chunks/Select_D-st_0vo.mjs';
import { f as formatCurrency, b as formatDate } from '../chunks/format_CTgnmbjx.mjs';
export { renderers } from '../renderers.mjs';

const opportunitiesApi = {
  list: (params = {}) => api.get('/opportunities?' + new URLSearchParams(params)),
  getById: (id) => api.get(`/opportunities/${id}`),
  create: (data) => api.post('/opportunities', data),
  update: (id, data) => api.patch(`/opportunities/${id}`, data),
  changeStage: (id, stage) => api.patch(`/opportunities/${id}/stage`, { stage }),
  getHistory: (id) => api.get(`/opportunities/${id}/history`),
};

function OpportunityForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState({
    companyId: initial?.company?._id || initial?.company?.id || "",
    eventType: initial?.eventType || "",
    segment: initial?.segment || "",
    estimatedValue: initial?.estimatedValue || "",
    projectionMonth: initial?.projectionMonth || "",
    attendees: initial?.attendees || "",
    estimatedEventDate: initial?.estimatedEventDate ? initial.estimatedEventDate.slice(0, 10) : "",
    nextActionAt: initial?.nextActionAt ? initial.nextActionAt.slice(0, 10) : "",
    nextActionDescription: initial?.nextActionDescription || "",
    notes: initial?.notes || ""
  });
  const [companies, setCompanies] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    Promise.all([
      companiesApi.list({ limit: 100 }),
      catalogsApi.list("EVENT_TYPE"),
      roomsApi.list()
    ]).then(([co, ev, ro]) => {
      setCompanies((co.data || []).map((c) => ({ value: c.id, label: c.name })));
      setEventTypes((ev.data || []).map((c) => ({ value: c.code, label: c.label })));
      setRooms((ro.data || []).map((r) => ({ value: r._id, label: r.name })));
    }).catch(() => {
    });
  }, []);
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const validate = () => {
    const err = {};
    if (!form.companyId) err.companyId = "La empresa es obligatoria";
    if (!form.eventType) err.eventType = "El tipo de evento es obligatorio";
    if (!form.estimatedValue) err.estimatedValue = "El valor estimado es obligatorio";
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
        companyId: form.companyId,
        eventType: form.eventType,
        segment: form.segment || void 0,
        estimatedValue: Number(form.estimatedValue),
        projectionMonth: form.projectionMonth || void 0,
        attendees: form.attendees ? Number(form.attendees) : void 0,
        estimatedEventDate: form.estimatedEventDate ? new Date(form.estimatedEventDate).toISOString() : void 0,
        nextActionAt: form.nextActionAt ? new Date(form.nextActionAt).toISOString() : void 0,
        nextActionDescription: form.nextActionDescription || void 0,
        notes: form.notes || void 0
      };
      if (initial) {
        await opportunitiesApi.update(initial.id, payload);
      } else {
        await opportunitiesApi.create(payload);
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
    /* @__PURE__ */ jsxs("div", { className: "form-grid-2", children: [
      /* @__PURE__ */ jsx(Select, { id: "companyId", label: "Empresa", value: form.companyId, onChange: set("companyId"), options: companies, placeholder: "Selecciona empresa", error: errors.companyId, required: true }),
      /* @__PURE__ */ jsx(Select, { id: "eventType", label: "Tipo de evento", value: form.eventType, onChange: set("eventType"), options: eventTypes, placeholder: "Selecciona tipo", error: errors.eventType, required: true }),
      /* @__PURE__ */ jsx(Input, { id: "estimatedValue", label: "Valor estimado (COP)", type: "number", value: form.estimatedValue, onChange: set("estimatedValue"), error: errors.estimatedValue, required: true }),
      /* @__PURE__ */ jsx(Input, { id: "projectionMonth", label: "Mes de proyección (YYYY-MM)", placeholder: "2025-07", value: form.projectionMonth, onChange: set("projectionMonth") }),
      /* @__PURE__ */ jsx(Input, { id: "attendees", label: "N.° de asistentes", type: "number", value: form.attendees, onChange: set("attendees") }),
      /* @__PURE__ */ jsx(Input, { id: "estimatedEventDate", label: "Fecha estimada del evento", type: "date", value: form.estimatedEventDate, onChange: set("estimatedEventDate") }),
      /* @__PURE__ */ jsx(Input, { id: "nextActionAt", label: "Fecha próxima acción", type: "date", value: form.nextActionAt, onChange: set("nextActionAt") }),
      /* @__PURE__ */ jsx(Input, { id: "nextActionDescription", label: "Descripción próxima acción", value: form.nextActionDescription, onChange: set("nextActionDescription") })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "input-field", style: { marginTop: "var(--space-3)" }, children: [
      /* @__PURE__ */ jsx("label", { className: "input-label", htmlFor: "notes", children: "Notas" }),
      /* @__PURE__ */ jsx("textarea", { id: "notes", className: "input-control", rows: 3, value: form.notes, onChange: set("notes") })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "form-actions", children: [
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: onCancel, children: "Cancelar" }),
      /* @__PURE__ */ jsx(Button, { type: "submit", loading, children: initial ? "Guardar cambios" : "Crear oportunidad" })
    ] })
  ] });
}

const STAGES = [
  { value: "PROSPECTO_INICIAL", label: "Prospecto inicial", probability: 10 },
  { value: "CALIFICADO", label: "Calificado", probability: 20 },
  { value: "VISITA_INSPECCION", label: "Visita / Inspección", probability: 35 },
  { value: "COTIZADO", label: "Cotizado", probability: 50 },
  { value: "NEGOCIACION", label: "Negociación", probability: 70 },
  { value: "APROBADO_PENDIENTE_PAGO", label: "Aprobado, pendiente pago", probability: 90 },
  { value: "CONFIRMADO", label: "Confirmado", probability: 100 },
  { value: "PERDIDO", label: "Perdido", probability: 0 }
];
function StageSelector({ opportunity, onSaved, onCancel }) {
  const [stage, setStage] = useState(opportunity.stage);
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (stage === opportunity.stage) {
      onCancel();
      return;
    }
    try {
      setLoading(true);
      setApiError("");
      await opportunitiesApi.changeStage(opportunity.id, stage);
      onSaved();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const selected = STAGES.find((s) => s.value === stage);
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
    apiError && /* @__PURE__ */ jsx(Alert, { type: "error", message: apiError, onClose: () => setApiError("") }),
    /* @__PURE__ */ jsx("p", { style: { marginBottom: "var(--space-4)", color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }, children: "Selecciona la nueva etapa. La probabilidad y el valor ponderado se recalcularán automáticamente." }),
    /* @__PURE__ */ jsx("div", { className: "stage-list", children: STAGES.map((s) => /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: `stage-option ${stage === s.value ? "stage-option--active" : ""}`,
        onClick: () => setStage(s.value),
        children: [
          /* @__PURE__ */ jsx("span", { className: "stage-label", children: s.label }),
          /* @__PURE__ */ jsxs("span", { className: "stage-prob", children: [
            s.probability,
            "%"
          ] })
        ]
      },
      s.value
    )) }),
    selected && /* @__PURE__ */ jsxs("p", { style: { marginTop: "var(--space-3)", fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }, children: [
      "Probabilidad seleccionada: ",
      /* @__PURE__ */ jsxs("strong", { children: [
        selected.probability,
        "%"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "form-actions", children: [
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: onCancel, children: "Cancelar" }),
      /* @__PURE__ */ jsx(Button, { type: "submit", loading, children: "Confirmar cambio" })
    ] })
  ] });
}

const STAGE_LABELS = {
  PROSPECTO_INICIAL: "Prospecto inicial",
  CALIFICADO: "Calificado",
  VISITA_INSPECCION: "Visita / Inspección",
  COTIZADO: "Cotizado",
  NEGOCIACION: "Negociación",
  APROBADO_PENDIENTE_PAGO: "Aprobado, pendiente pago",
  CONFIRMADO: "Confirmado",
  PERDIDO: "Perdido"
};
const STAGE_VARIANT = {
  CONFIRMADO: "badge-success",
  PERDIDO: "badge-danger",
  NEGOCIACION: "badge-warning",
  APROBADO_PENDIENTE_PAGO: "badge-warning"
};
const COLUMNS = [
  {
    key: "company",
    label: "Empresa",
    render: (r) => /* @__PURE__ */ jsx("a", { href: `/empresas/${r.company?.id || r.company?._id}`, children: r.company?.name || "—" })
  },
  { key: "eventType", label: "Tipo de evento" },
  {
    key: "stage",
    label: "Etapa",
    render: (r) => /* @__PURE__ */ jsx("span", { className: `badge ${STAGE_VARIANT[r.stage] || "badge-neutral"}`, children: STAGE_LABELS[r.stage] || r.stage })
  },
  { key: "estimatedValue", label: "Valor estimado", render: (r) => formatCurrency(r.estimatedValue) },
  { key: "weightedValue", label: "Valor ponderado", render: (r) => formatCurrency(r.weightedValue) },
  { key: "projectionMonth", label: "Mes proyección" },
  { key: "nextActionAt", label: "Próxima acción", render: (r) => formatDate(r.nextActionAt) },
  {
    key: "overdue",
    label: "",
    width: 60,
    render: (r) => r.isOverdue ? /* @__PURE__ */ jsx("span", { className: "badge badge-danger", children: "Vencida" }) : null
  },
  {
    key: "actions",
    label: "",
    width: 120,
    render: (r, onStage, onEdit) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "var(--space-2)" }, children: [
      /* @__PURE__ */ jsx("button", { className: "link-btn", onClick: () => onEdit(r), children: "Editar" }),
      /* @__PURE__ */ jsx("button", { className: "link-btn", onClick: () => onStage(r), children: "Etapa" })
    ] })
  }
];
function OpportunityList() {
  const [opps, setOpps] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [stageFilter, setStageFilter] = useState("");
  const load = async () => {
    try {
      setLoading(true);
      const params = {};
      if (stageFilter) params.stage = stageFilter;
      const res = await opportunitiesApi.list(params);
      setOpps(res.data);
      setMeta(res.meta);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [stageFilter]);
  const handleEdit = (opp) => {
    setSelected(opp);
    setModal("edit");
  };
  const handleStage = (opp) => {
    setSelected(opp);
    setModal("stage");
  };
  const columns = COLUMNS.map(
    (col) => col.key === "actions" ? { ...col, render: (r) => col.render(r, handleStage, handleEdit) } : col
  );
  return /* @__PURE__ */ jsxs("div", { className: "page-container", children: [
    /* @__PURE__ */ jsxs("div", { className: "page-header", children: [
      /* @__PURE__ */ jsx("h1", { className: "page-title", children: "Pipeline de oportunidades" }),
      /* @__PURE__ */ jsx(Button, { onClick: () => {
        setSelected(null);
        setModal("new");
      }, children: "Nueva oportunidad" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "page-filters", children: /* @__PURE__ */ jsxs("select", { className: "input-control", value: stageFilter, onChange: (e) => setStageFilter(e.target.value), style: { maxWidth: 220 }, children: [
      /* @__PURE__ */ jsx("option", { value: "", children: "Todas las etapas" }),
      Object.entries(STAGE_LABELS).map(([v, l]) => /* @__PURE__ */ jsx("option", { value: v, children: l }, v))
    ] }) }),
    error && /* @__PURE__ */ jsx(Alert, { type: "error", message: error, onClose: () => setError("") }),
    /* @__PURE__ */ jsx(Table, { columns, rows: opps, loading, emptyText: "No hay oportunidades" }),
    meta && /* @__PURE__ */ jsxs("p", { className: "table-meta", children: [
      "Mostrando ",
      opps.length,
      " de ",
      meta.total
    ] }),
    /* @__PURE__ */ jsx(Modal, { open: modal === "new" || modal === "edit", title: modal === "edit" ? "Editar oportunidad" : "Nueva oportunidad", onClose: () => setModal(null), size: "lg", children: /* @__PURE__ */ jsx(OpportunityForm, { initial: selected, onSaved: () => {
      setModal(null);
      load();
    }, onCancel: () => setModal(null) }) }),
    /* @__PURE__ */ jsx(Modal, { open: modal === "stage", title: "Cambiar etapa", onClose: () => setModal(null), size: "sm", children: selected && /* @__PURE__ */ jsx(
      StageSelector,
      {
        opportunity: selected,
        onSaved: () => {
          setModal(null);
          load();
        },
        onCancel: () => setModal(null)
      }
    ) })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Pipeline" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "OpportunityList", OpportunityList, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/components/pipeline/OpportunityList.jsx", "client:component-export": "OpportunityList" })} ` })}`;
}, "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/pipeline/index.astro", void 0);

const $$file = "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/pipeline/index.astro";
const $$url = "/pipeline";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
