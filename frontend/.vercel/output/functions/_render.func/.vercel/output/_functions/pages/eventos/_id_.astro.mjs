import { c as createComponent, r as renderComponent, b as renderTemplate, a as createAstro } from '../../chunks/astro/server_BcKwslGY.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../../chunks/Layout_BCbbW_HH.mjs';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { eventsApi } from '../../chunks/events.api_DmZ8-Dxr.mjs';
import { B as Button } from '../../chunks/Button_BuSRxPWM.mjs';
import { a as api, A as Alert } from '../../chunks/Alert_AtUShQUE.mjs';
import { M as Modal } from '../../chunks/Modal_FzQIQuvI.mjs';
import { E as EventForm } from '../../chunks/EventForm_DKnC5LnK.mjs';
import { s as servicesApi } from '../../chunks/services.api_nY_a1Fxr.mjs';
import { f as formatCurrency, b as formatDate } from '../../chunks/format_CTgnmbjx.mjs';
export { renderers } from '../../renderers.mjs';

const beosApi = {
  getByEvent: (eventId) => api.get(`/beos/event/${eventId}`),
  create: (data) => api.post('/beos', data),
  update: (id, data) => api.patch(`/beos/${id}`, data),
  changeStatus: (id, status) => api.patch(`/beos/${id}/status`, { status }),
};

const BEO_STATUS_LABELS = { BORRADOR: "Borrador", EMITIDO: "Emitido", CONFIRMADO: "Confirmado" };
const BEO_STATUS_VARIANT = { BORRADOR: "neutral", EMITIDO: "warning", CONFIRMADO: "success" };
const SETUP_TYPES = [
  { value: "AUDITORIO", label: "Auditorio" },
  { value: "ESCUELA", label: "Escuela" },
  { value: "U_SHAPE", label: "U-Shape" },
  { value: "COCTEL", label: "Coctel" },
  { value: "BANQUETE", label: "Banquete" }
];
const EMPTY_MENU = { time: "", description: "", serviceId: "", quantity: 1, notes: "" };
const EMPTY_AV = { description: "", serviceId: "", quantity: 1, notes: "" };
const EMPTY_PERSONNEL = { role: "", quantity: 1, notes: "" };
const EMPTY_SUPPLIER = { name: "", service: "", contact: "", notes: "" };
function BeoPanel({ eventId }) {
  const [beo, setBeo] = useState(null);
  const [services, setServices] = useState([]);
  const [tab, setTab] = useState("setup");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState(null);
  const load = async () => {
    try {
      setLoading(true);
      const [beoRes, svcRes] = await Promise.all([
        beosApi.getByEvent(eventId),
        servicesApi.list({ limit: 200 })
      ]);
      setBeo(beoRes.data);
      setServices(svcRes.data || []);
      if (beoRes.data) setDraft(cloneBeo(beoRes.data));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [eventId]);
  function cloneBeo(b) {
    return {
      setup: { type: b.setup?.type || "", chairs: b.setup?.chairs || "", tables: b.setup?.tables || "", notes: b.setup?.notes || "", readyAt: b.setup?.readyAt ? b.setup.readyAt.slice(0, 16) : "" },
      menu: (b.menu || []).map((m) => ({ time: m.time || "", description: m.description, serviceId: m.serviceId?.id || "", quantity: m.quantity || 1, notes: m.notes || "" })),
      audiovisual: (b.audiovisual || []).map((a) => ({ description: a.description, serviceId: a.serviceId?.id || "", quantity: a.quantity || 1, notes: a.notes || "" })),
      personnel: (b.personnel || []).map((p) => ({ role: p.role, quantity: p.quantity || 1, notes: p.notes || "" })),
      suppliers: (b.suppliers || []).map((s) => ({ name: s.name, service: s.service || "", contact: s.contact || "", notes: s.notes || "" })),
      generalNotes: b.generalNotes || ""
    };
  }
  const handleCreate = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await beosApi.create({ eventId, menu: [], audiovisual: [], personnel: [], suppliers: [] });
      setBeo(res.data);
      setDraft(cloneBeo(res.data));
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };
  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        setup: {
          ...draft.setup,
          chairs: draft.setup.chairs ? Number(draft.setup.chairs) : void 0,
          tables: draft.setup.tables ? Number(draft.setup.tables) : void 0,
          readyAt: draft.setup.readyAt ? new Date(draft.setup.readyAt).toISOString() : void 0
        },
        menu: draft.menu.map((m) => ({ ...m, serviceId: m.serviceId || void 0, quantity: Number(m.quantity) })),
        audiovisual: draft.audiovisual.map((a) => ({ ...a, serviceId: a.serviceId || void 0, quantity: Number(a.quantity) })),
        personnel: draft.personnel.map((p) => ({ ...p, quantity: Number(p.quantity) })),
        suppliers: draft.suppliers,
        generalNotes: draft.generalNotes
      };
      const res = await beosApi.update(beo.id, payload);
      setBeo(res.data);
      setDraft(cloneBeo(res.data));
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };
  const handleStatusChange = async (status) => {
    setSaving(true);
    setError("");
    try {
      const res = await beosApi.changeStatus(beo.id, status);
      setBeo(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };
  const setSetup = (field, value) => setDraft((d) => ({ ...d, setup: { ...d.setup, [field]: value } }));
  const setList = (list, setter) => setDraft((d) => ({ ...d, [list]: setter(d[list]) }));
  const addItem = (list, empty) => setList(list, (items) => [...items, { ...empty }]);
  const removeItem = (list, idx) => setList(list, (items) => items.filter((_, i) => i !== idx));
  const setItem = (list, idx, field, value) => setList(list, (items) => {
    const next = [...items];
    next[idx] = { ...next[idx], [field]: value };
    return next;
  });
  const abServices = services.filter((s) => s.category === "AB");
  const avServices = services.filter((s) => s.category === "AV");
  if (loading) return /* @__PURE__ */ jsx("p", { className: "page-loading", children: "Cargando BEO..." });
  if (!beo) {
    return /* @__PURE__ */ jsxs("div", { style: { textAlign: "center", padding: "var(--space-10)" }, children: [
      error && /* @__PURE__ */ jsx(Alert, { type: "error", message: error, onClose: () => setError("") }),
      /* @__PURE__ */ jsx("p", { className: "text-muted", style: { marginBottom: "var(--space-4)" }, children: "Este evento aún no tiene una Orden Operativa (BEO)." }),
      /* @__PURE__ */ jsx(Button, { onClick: handleCreate, disabled: saving, children: saving ? "Creando..." : "Crear BEO" })
    ] });
  }
  const isLocked = beo.status === "CONFIRMADO";
  return /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "var(--space-4)" }, children: [
    error && /* @__PURE__ */ jsx(Alert, { type: "error", message: error, onClose: () => setError("") }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-3)" }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "var(--space-3)" }, children: [
        /* @__PURE__ */ jsx("span", { style: { fontWeight: "var(--font-semibold)", fontSize: "var(--text-sm)" }, children: beo.number }),
        /* @__PURE__ */ jsx("span", { className: `badge badge-${BEO_STATUS_VARIANT[beo.status]}`, children: BEO_STATUS_LABELS[beo.status] })
      ] }),
      /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: "var(--space-2)" }, children: !isLocked && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: handleSave, disabled: saving, children: saving ? "Guardando..." : "Guardar" }),
        beo.status === "BORRADOR" && /* @__PURE__ */ jsx(Button, { onClick: () => handleStatusChange("EMITIDO"), disabled: saving, children: "Emitir" }),
        beo.status === "EMITIDO" && /* @__PURE__ */ jsx(Button, { onClick: () => handleStatusChange("CONFIRMADO"), disabled: saving, children: "Confirmar" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "tabs", children: [["setup", "Montaje"], ["menu", "A&B"], ["audiovisual", "AV"], ["personnel", "Personal"], ["suppliers", "Proveedores"], ["notes", "Notas"]].map(([t, l]) => /* @__PURE__ */ jsx("button", { className: `tab-btn ${tab === t ? "tab-btn--active" : ""}`, onClick: () => setTab(t), children: l }, t)) }),
    tab === "setup" && draft && /* @__PURE__ */ jsxs("div", { className: "form-grid-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
        /* @__PURE__ */ jsx("label", { className: "input-label", children: "Tipo de montaje" }),
        /* @__PURE__ */ jsxs("select", { className: "input-control", value: draft.setup.type, onChange: (e) => setSetup("type", e.target.value), disabled: isLocked, children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Sin especificar" }),
          SETUP_TYPES.map((s) => /* @__PURE__ */ jsx("option", { value: s.value, children: s.label }, s.value))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
        /* @__PURE__ */ jsx("label", { className: "input-label", children: "Montaje listo a las" }),
        /* @__PURE__ */ jsx("input", { className: "input-control", type: "datetime-local", value: draft.setup.readyAt, onChange: (e) => setSetup("readyAt", e.target.value), disabled: isLocked })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
        /* @__PURE__ */ jsx("label", { className: "input-label", children: "Sillas" }),
        /* @__PURE__ */ jsx("input", { className: "input-control", type: "number", min: "0", value: draft.setup.chairs, onChange: (e) => setSetup("chairs", e.target.value), disabled: isLocked })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
        /* @__PURE__ */ jsx("label", { className: "input-label", children: "Mesas" }),
        /* @__PURE__ */ jsx("input", { className: "input-control", type: "number", min: "0", value: draft.setup.tables, onChange: (e) => setSetup("tables", e.target.value), disabled: isLocked })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "input-field", style: { gridColumn: "1/-1" }, children: [
        /* @__PURE__ */ jsx("label", { className: "input-label", children: "Notas de montaje" }),
        /* @__PURE__ */ jsx("textarea", { className: "input-control", rows: 3, value: draft.setup.notes, onChange: (e) => setSetup("notes", e.target.value), disabled: isLocked })
      ] })
    ] }),
    tab === "menu" && draft && /* @__PURE__ */ jsx(
      BeoItemList,
      {
        items: draft.menu,
        isLocked,
        onAdd: () => addItem("menu", EMPTY_MENU),
        onRemove: (idx) => removeItem("menu", idx),
        onSet: (idx, f, v) => setItem("menu", idx, f, v),
        services: abServices,
        showTime: true,
        emptyText: "Sin ítems de A&B"
      }
    ),
    tab === "audiovisual" && draft && /* @__PURE__ */ jsx(
      BeoItemList,
      {
        items: draft.audiovisual,
        isLocked,
        onAdd: () => addItem("audiovisual", EMPTY_AV),
        onRemove: (idx) => removeItem("audiovisual", idx),
        onSet: (idx, f, v) => setItem("audiovisual", idx, f, v),
        services: avServices,
        emptyText: "Sin equipos AV"
      }
    ),
    tab === "personnel" && draft && /* @__PURE__ */ jsxs("div", { children: [
      !isLocked && /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => addItem("personnel", EMPTY_PERSONNEL), style: { marginBottom: "var(--space-3)" }, children: "+ Agregar personal" }),
      draft.personnel.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-muted", children: "Sin personal asignado." }),
      draft.personnel.map((p, idx) => /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "2fr 1fr 2fr auto", gap: "var(--space-2)", alignItems: "end", marginBottom: "var(--space-2)" }, children: [
        /* @__PURE__ */ jsxs("div", { className: "input-field", style: { marginBottom: 0 }, children: [
          idx === 0 && /* @__PURE__ */ jsx("label", { className: "input-label", children: "Rol" }),
          /* @__PURE__ */ jsx("input", { className: "input-control", value: p.role, onChange: (e) => setItem("personnel", idx, "role", e.target.value), disabled: isLocked, placeholder: "Ej: Mesero" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "input-field", style: { marginBottom: 0 }, children: [
          idx === 0 && /* @__PURE__ */ jsx("label", { className: "input-label", children: "Cantidad" }),
          /* @__PURE__ */ jsx("input", { className: "input-control", type: "number", min: "1", value: p.quantity, onChange: (e) => setItem("personnel", idx, "quantity", e.target.value), disabled: isLocked })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "input-field", style: { marginBottom: 0 }, children: [
          idx === 0 && /* @__PURE__ */ jsx("label", { className: "input-label", children: "Notas" }),
          /* @__PURE__ */ jsx("input", { className: "input-control", value: p.notes, onChange: (e) => setItem("personnel", idx, "notes", e.target.value), disabled: isLocked })
        ] }),
        !isLocked && /* @__PURE__ */ jsx("button", { type: "button", className: "link-btn link-btn--danger", style: { paddingBottom: "var(--space-2)" }, onClick: () => removeItem("personnel", idx), children: "✕" })
      ] }, idx))
    ] }),
    tab === "suppliers" && draft && /* @__PURE__ */ jsxs("div", { children: [
      !isLocked && /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => addItem("suppliers", EMPTY_SUPPLIER), style: { marginBottom: "var(--space-3)" }, children: "+ Agregar proveedor" }),
      draft.suppliers.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-muted", children: "Sin proveedores externos." }),
      draft.suppliers.map((s, idx) => /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "2fr 2fr 2fr auto", gap: "var(--space-2)", alignItems: "end", marginBottom: "var(--space-2)" }, children: [
        /* @__PURE__ */ jsxs("div", { className: "input-field", style: { marginBottom: 0 }, children: [
          idx === 0 && /* @__PURE__ */ jsx("label", { className: "input-label", children: "Proveedor" }),
          /* @__PURE__ */ jsx("input", { className: "input-control", value: s.name, onChange: (e) => setItem("suppliers", idx, "name", e.target.value), disabled: isLocked })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "input-field", style: { marginBottom: 0 }, children: [
          idx === 0 && /* @__PURE__ */ jsx("label", { className: "input-label", children: "Servicio" }),
          /* @__PURE__ */ jsx("input", { className: "input-control", value: s.service, onChange: (e) => setItem("suppliers", idx, "service", e.target.value), disabled: isLocked })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "input-field", style: { marginBottom: 0 }, children: [
          idx === 0 && /* @__PURE__ */ jsx("label", { className: "input-label", children: "Contacto" }),
          /* @__PURE__ */ jsx("input", { className: "input-control", value: s.contact, onChange: (e) => setItem("suppliers", idx, "contact", e.target.value), disabled: isLocked })
        ] }),
        !isLocked && /* @__PURE__ */ jsx("button", { type: "button", className: "link-btn link-btn--danger", style: { paddingBottom: "var(--space-2)" }, onClick: () => removeItem("suppliers", idx), children: "✕" })
      ] }, idx))
    ] }),
    tab === "notes" && draft && /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
      /* @__PURE__ */ jsx("label", { className: "input-label", children: "Notas generales del BEO" }),
      /* @__PURE__ */ jsx("textarea", { className: "input-control", rows: 8, value: draft.generalNotes, onChange: (e) => setDraft((d) => ({ ...d, generalNotes: e.target.value })), disabled: isLocked })
    ] })
  ] });
}
function BeoItemList({ items, isLocked, onAdd, onRemove, onSet, services, showTime, emptyText }) {
  return /* @__PURE__ */ jsxs("div", { children: [
    !isLocked && /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: onAdd, style: { marginBottom: "var(--space-3)" }, children: "+ Agregar ítem" }),
    items.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-muted", children: emptyText }),
    items.map((item, idx) => /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: showTime ? "80px 2fr 2fr 60px auto" : "2fr 2fr 60px auto", gap: "var(--space-2)", alignItems: "end", marginBottom: "var(--space-2)" }, children: [
      showTime && /* @__PURE__ */ jsxs("div", { className: "input-field", style: { marginBottom: 0 }, children: [
        idx === 0 && /* @__PURE__ */ jsx("label", { className: "input-label", children: "Hora" }),
        /* @__PURE__ */ jsx("input", { className: "input-control", type: "time", value: item.time, onChange: (e) => onSet(idx, "time", e.target.value), disabled: isLocked })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "input-field", style: { marginBottom: 0 }, children: [
        idx === 0 && /* @__PURE__ */ jsx("label", { className: "input-label", children: "Descripción" }),
        /* @__PURE__ */ jsx("input", { className: "input-control", value: item.description, onChange: (e) => onSet(idx, "description", e.target.value), disabled: isLocked, required: true })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "input-field", style: { marginBottom: 0 }, children: [
        idx === 0 && /* @__PURE__ */ jsx("label", { className: "input-label", children: "Servicio" }),
        /* @__PURE__ */ jsxs("select", { className: "input-control", value: item.serviceId, onChange: (e) => onSet(idx, "serviceId", e.target.value), disabled: isLocked, children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Sin vincular" }),
          services.map((s) => /* @__PURE__ */ jsx("option", { value: s.id, children: s.name }, s.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "input-field", style: { marginBottom: 0 }, children: [
        idx === 0 && /* @__PURE__ */ jsx("label", { className: "input-label", children: "Cant." }),
        /* @__PURE__ */ jsx("input", { className: "input-control", type: "number", min: "1", value: item.quantity, onChange: (e) => onSet(idx, "quantity", e.target.value), disabled: isLocked })
      ] }),
      !isLocked && /* @__PURE__ */ jsx("button", { type: "button", className: "link-btn link-btn--danger", style: { paddingBottom: "var(--space-2)" }, onClick: () => onRemove(idx), children: "✕" })
    ] }, idx))
  ] });
}

const eventCostsApi = {
  listByEvent: (eventId) => api.get(`/event-costs/event/${eventId}`),
  getSummary: (eventId, revenue = 0) => api.get(`/event-costs/event/${eventId}/summary`, { revenue }),
  create: (data) => api.post('/event-costs', data),
  update: (id, data) => api.patch(`/event-costs/${id}`, data),
  remove: (id) => api.delete(`/event-costs/${id}`),
};

const CATEGORIES = ["AB", "AV", "SALON", "PERSONAL", "PROVEEDOR", "OTRO"];
const CATEGORY_LABEL = {
  AB: "A&B",
  AV: "Audiovisual",
  SALON: "Salón",
  PERSONAL: "Personal",
  PROVEEDOR: "Proveedor",
  OTRO: "Otro"
};
const EMPTY_FORM = {
  category: "AB",
  description: "",
  estimatedAmount: "",
  actualAmount: "",
  vendor: "",
  notes: ""
};
function EventCostsPanel({ eventId, revenue = 0 }) {
  const [costs, setCosts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const load = async () => {
    try {
      const [costsRes, summaryRes] = await Promise.all([
        eventCostsApi.listByEvent(eventId),
        eventCostsApi.getSummary(eventId, revenue)
      ]);
      setCosts(costsRes.data || []);
      setSummary(summaryRes.data);
    } catch (e) {
      setError(e.message);
    }
  };
  useEffect(() => {
    load();
  }, [eventId, revenue]);
  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };
  const openEdit = (cost) => {
    setEditing(cost.id);
    setForm({
      category: cost.category,
      description: cost.description,
      estimatedAmount: String(cost.estimatedAmount),
      actualAmount: String(cost.actualAmount),
      vendor: cost.vendor || "",
      notes: cost.notes || ""
    });
    setShowForm(true);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        eventId,
        category: form.category,
        description: form.description,
        estimatedAmount: parseFloat(form.estimatedAmount) || 0,
        actualAmount: parseFloat(form.actualAmount) || 0,
        vendor: form.vendor || void 0,
        notes: form.notes || void 0
      };
      if (editing) {
        await eventCostsApi.update(editing, payload);
      } else {
        await eventCostsApi.create(payload);
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditing(null);
      load();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este costo?")) return;
    try {
      await eventCostsApi.remove(id);
      load();
    } catch (e) {
      setError(e.message);
    }
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    error && /* @__PURE__ */ jsx(Alert, { type: "error", message: error, onClose: () => setError("") }),
    summary && /* @__PURE__ */ jsxs("div", { className: "profitability-summary", children: [
      /* @__PURE__ */ jsxs("div", { className: "profit-card", children: [
        /* @__PURE__ */ jsx("span", { className: "profit-label", children: "Ingresos" }),
        /* @__PURE__ */ jsx("span", { className: "profit-value", children: formatCurrency(summary.revenue) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "profit-card", children: [
        /* @__PURE__ */ jsx("span", { className: "profit-label", children: "Costos reales" }),
        /* @__PURE__ */ jsx("span", { className: "profit-value", style: { color: "var(--color-danger)" }, children: formatCurrency(summary.totalActual) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "profit-card", children: [
        /* @__PURE__ */ jsx("span", { className: "profit-label", children: "Margen bruto" }),
        /* @__PURE__ */ jsx("span", { className: "profit-value", style: { color: summary.grossMargin >= 0 ? "var(--color-success)" : "var(--color-danger)" }, children: formatCurrency(summary.grossMargin) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "profit-card", children: [
        /* @__PURE__ */ jsx("span", { className: "profit-label", children: "Margen %" }),
        /* @__PURE__ */ jsxs("span", { className: "profit-value", style: { color: summary.marginRate >= 0 ? "var(--color-success)" : "var(--color-danger)" }, children: [
          summary.marginRate.toFixed(1),
          "%"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: "var(--space-4)" }, children: /* @__PURE__ */ jsx("button", { className: "btn btn-primary", style: { fontSize: "var(--text-sm)" }, onClick: openCreate, children: "+ Agregar costo" }) }),
    showForm && /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, style: { background: "var(--color-bg)", padding: "var(--space-4)", borderRadius: "var(--radius-md)", marginBottom: "var(--space-4)" }, children: [
      /* @__PURE__ */ jsxs("div", { className: "form-grid-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
          /* @__PURE__ */ jsx("label", { className: "input-label", children: "Categoría" }),
          /* @__PURE__ */ jsx("select", { className: "select-field", value: form.category, onChange: (e) => setForm((f) => ({ ...f, category: e.target.value })), children: CATEGORIES.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: CATEGORY_LABEL[c] }, c)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
          /* @__PURE__ */ jsxs("label", { className: "input-label", children: [
            "Descripción ",
            /* @__PURE__ */ jsx("span", { className: "input-required", children: "*" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: "input",
              type: "text",
              value: form.description,
              onChange: (e) => setForm((f) => ({ ...f, description: e.target.value })),
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
          /* @__PURE__ */ jsx("label", { className: "input-label", children: "Costo estimado" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: "input",
              type: "number",
              min: "0",
              step: "0.01",
              value: form.estimatedAmount,
              onChange: (e) => setForm((f) => ({ ...f, estimatedAmount: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
          /* @__PURE__ */ jsx("label", { className: "input-label", children: "Costo real" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: "input",
              type: "number",
              min: "0",
              step: "0.01",
              value: form.actualAmount,
              onChange: (e) => setForm((f) => ({ ...f, actualAmount: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
          /* @__PURE__ */ jsx("label", { className: "input-label", children: "Proveedor" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: "input",
              type: "text",
              value: form.vendor,
              onChange: (e) => setForm((f) => ({ ...f, vendor: e.target.value }))
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-actions", children: [
        /* @__PURE__ */ jsx("button", { type: "button", className: "btn btn-secondary", onClick: () => setShowForm(false), children: "Cancelar" }),
        /* @__PURE__ */ jsx("button", { type: "submit", className: "btn btn-primary", disabled: saving, children: saving ? "Guardando..." : "Guardar" })
      ] })
    ] }),
    costs.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-muted", children: "Sin costos registrados." }) : /* @__PURE__ */ jsxs("table", { className: "table", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { children: "Categoría" }),
        /* @__PURE__ */ jsx("th", { children: "Descripción" }),
        /* @__PURE__ */ jsx("th", { children: "Proveedor" }),
        /* @__PURE__ */ jsx("th", { children: "Estimado" }),
        /* @__PURE__ */ jsx("th", { children: "Real" }),
        /* @__PURE__ */ jsx("th", {})
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: costs.map((c) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", { className: "badge badge-neutral", children: CATEGORY_LABEL[c.category] }) }),
        /* @__PURE__ */ jsx("td", { children: c.description }),
        /* @__PURE__ */ jsx("td", { children: c.vendor || "—" }),
        /* @__PURE__ */ jsx("td", { children: formatCurrency(c.estimatedAmount) }),
        /* @__PURE__ */ jsx("td", { children: formatCurrency(c.actualAmount) }),
        /* @__PURE__ */ jsxs("td", { style: { display: "flex", gap: "var(--space-2)" }, children: [
          /* @__PURE__ */ jsx("button", { className: "link-btn", onClick: () => openEdit(c), children: "Editar" }),
          /* @__PURE__ */ jsx("button", { className: "link-btn", style: { color: "var(--color-danger)" }, onClick: () => handleDelete(c.id), children: "Eliminar" })
        ] })
      ] }, c.id)) })
    ] })
  ] });
}

const STATUS_LABELS = {
  CONFIRMADO: "Confirmado",
  EN_PRODUCCION: "En producción",
  REALIZADO: "Realizado",
  CANCELADO: "Cancelado",
  POSPUESTO: "Pospuesto"
};
const STATUS_VARIANT = {
  CONFIRMADO: "success",
  EN_PRODUCCION: "warning",
  REALIZADO: "neutral",
  CANCELADO: "danger",
  POSPUESTO: "warning"
};
const SETUP_LABELS = { AUDITORIO: "Auditorio", ESCUELA: "Escuela", U_SHAPE: "U-Shape", COCTEL: "Coctel", BANQUETE: "Banquete" };
const NEXT_STATUSES = {
  CONFIRMADO: [{ value: "EN_PRODUCCION", label: "Iniciar producción" }, { value: "POSPUESTO", label: "Posponer" }, { value: "CANCELADO", label: "Cancelar" }],
  EN_PRODUCCION: [{ value: "REALIZADO", label: "Marcar como realizado" }, { value: "POSPUESTO", label: "Posponer" }, { value: "CANCELADO", label: "Cancelar" }],
  POSPUESTO: [{ value: "CONFIRMADO", label: "Reconfirmar" }, { value: "CANCELADO", label: "Cancelar" }],
  REALIZADO: [],
  CANCELADO: []
};
function EventDetail({ id }) {
  const [event, setEvent] = useState(null);
  const [tab, setTab] = useState("info");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const load = async () => {
    try {
      setLoading(true);
      const res = await eventsApi.getById(id);
      setEvent(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [id]);
  const handleStatusChange = async (status) => {
    setActionLoading(status);
    try {
      await eventsApi.changeStatus(id, status);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading("");
    }
  };
  if (loading) return /* @__PURE__ */ jsx("p", { className: "page-loading", children: "Cargando evento..." });
  if (!event) return /* @__PURE__ */ jsx("p", { className: "page-loading", children: "Evento no encontrado." });
  const nextStatuses = NEXT_STATUSES[event.status] || [];
  return /* @__PURE__ */ jsxs("div", { className: "page-container", children: [
    error && /* @__PURE__ */ jsx(Alert, { type: "error", message: error, onClose: () => setError("") }),
    /* @__PURE__ */ jsxs("div", { className: "page-header", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "page-title", children: [
          event.number,
          " — ",
          event.name
        ] }),
        /* @__PURE__ */ jsx("span", { className: `badge badge-${STATUS_VARIANT[event.status] || "neutral"}`, style: { marginTop: 4 }, children: STATUS_LABELS[event.status] })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }, children: [
        event.status !== "CANCELADO" && event.status !== "REALIZADO" && /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => setShowEdit(true), children: "Editar" }),
        nextStatuses.map((ns) => /* @__PURE__ */ jsx(
          Button,
          {
            variant: ns.value === "CANCELADO" ? "secondary" : "primary",
            onClick: () => handleStatusChange(ns.value),
            disabled: Boolean(actionLoading),
            children: actionLoading === ns.value ? "..." : ns.label
          },
          ns.value
        ))
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "tabs", style: { marginBottom: "var(--space-4)" }, children: [
      { key: "info", label: "Información" },
      { key: "beo", label: "BEO (Orden Operativa)" },
      { key: "costos", label: "Costos / Utilidad" }
    ].map(({ key, label }) => /* @__PURE__ */ jsx("button", { className: `tab-btn ${tab === key ? "tab-btn--active" : ""}`, onClick: () => setTab(key), children: label }, key)) }),
    tab === "info" && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "detail-grid", children: [
        /* @__PURE__ */ jsxs("div", { className: "info-row", children: [
          /* @__PURE__ */ jsx("span", { className: "info-label", children: "Empresa" }),
          /* @__PURE__ */ jsx("span", { className: "info-value", children: event.company?.name || "—" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "info-row", children: [
          /* @__PURE__ */ jsx("span", { className: "info-label", children: "Fecha del evento" }),
          /* @__PURE__ */ jsx("span", { className: "info-value", children: formatDate(event.eventDate) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "info-row", children: [
          /* @__PURE__ */ jsx("span", { className: "info-label", children: "Tipo de evento" }),
          /* @__PURE__ */ jsx("span", { className: "info-value", children: event.eventType || "—" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "info-row", children: [
          /* @__PURE__ */ jsx("span", { className: "info-label", children: "Salón" }),
          /* @__PURE__ */ jsx("span", { className: "info-value", children: event.room?.name || "—" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "info-row", children: [
          /* @__PURE__ */ jsx("span", { className: "info-label", children: "Montaje" }),
          /* @__PURE__ */ jsx("span", { className: "info-value", children: SETUP_LABELS[event.setupType] || event.setupType || "—" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "info-row", children: [
          /* @__PURE__ */ jsx("span", { className: "info-label", children: "Asistentes" }),
          /* @__PURE__ */ jsx("span", { className: "info-value", children: event.attendees || "—" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "info-row", children: [
          /* @__PURE__ */ jsx("span", { className: "info-label", children: "Horario" }),
          /* @__PURE__ */ jsx("span", { className: "info-value", children: event.startTime && event.endTime ? `${event.startTime} — ${event.endTime}` : event.startTime || "—" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "info-row", children: [
          /* @__PURE__ */ jsx("span", { className: "info-label", children: "Valor total" }),
          /* @__PURE__ */ jsx("span", { className: "info-value", children: formatCurrency(event.totalValue) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "info-row", children: [
          /* @__PURE__ */ jsx("span", { className: "info-label", children: "Responsable" }),
          /* @__PURE__ */ jsx("span", { className: "info-value", children: event.owner?.name || "—" })
        ] }),
        event.opportunityId && /* @__PURE__ */ jsxs("div", { className: "info-row", children: [
          /* @__PURE__ */ jsx("span", { className: "info-label", children: "Oportunidad origen" }),
          /* @__PURE__ */ jsx("span", { className: "info-value", children: /* @__PURE__ */ jsx("a", { href: `/pipeline`, style: { color: "var(--color-primary)" }, children: "Ver pipeline" }) })
        ] }),
        event.quote && /* @__PURE__ */ jsxs("div", { className: "info-row", children: [
          /* @__PURE__ */ jsx("span", { className: "info-label", children: "Cotización" }),
          /* @__PURE__ */ jsx("span", { className: "info-value", children: /* @__PURE__ */ jsx("a", { href: `/cotizaciones/${event.quote.id || event.quote._id}`, children: event.quote.number }) })
        ] })
      ] }),
      event.notes && /* @__PURE__ */ jsxs("div", { className: "panel", style: { padding: "var(--space-4)", marginTop: "var(--space-4)" }, children: [
        /* @__PURE__ */ jsx("p", { className: "input-label", style: { marginBottom: "var(--space-2)" }, children: "Notas" }),
        /* @__PURE__ */ jsx("p", { style: { fontSize: "var(--text-sm)", whiteSpace: "pre-wrap" }, children: event.notes })
      ] })
    ] }),
    tab === "beo" && /* @__PURE__ */ jsx(BeoPanel, { eventId: id }),
    tab === "costos" && /* @__PURE__ */ jsx(EventCostsPanel, { eventId: id, revenue: event.totalValue || 0 }),
    /* @__PURE__ */ jsx(Modal, { open: showEdit, title: "Editar evento", onClose: () => setShowEdit(false), children: /* @__PURE__ */ jsx(
      EventForm,
      {
        eventId: id,
        onSaved: () => {
          setShowEdit(false);
          load();
        },
        onCancel: () => setShowEdit(false)
      }
    ) })
  ] });
}

const $$Astro = createAstro();
const $$id = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Evento" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "EventDetail", EventDetail, { "id": id, "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/components/events/EventDetail.jsx", "client:component-export": "EventDetail" })} ` })}`;
}, "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/eventos/[id].astro", void 0);

const $$file = "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/eventos/[id].astro";
const $$url = "/eventos/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
