import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { q as quotesApi } from './quotes.api_5OJtDyrT.mjs';
import { c as companiesApi } from './companies.api_b-6teDnv.mjs';
import { r as roomsApi } from './rooms.api_DgCTYlBO.mjs';
import { s as servicesApi } from './services.api_nY_a1Fxr.mjs';
import { B as Button } from './Button_BuSRxPWM.mjs';
import { A as Alert } from './Alert_AtUShQUE.mjs';
import { f as formatCurrency } from './format_CTgnmbjx.mjs';

const ITEM_CATEGORIES = ["SALON", "AB", "AV", "OTROS"];
const EMPTY_ITEM = { description: "", category: "OTROS", serviceId: "", quantity: 1, unitPrice: 0 };
function QuoteForm({ quoteId, onSaved, onCancel }) {
  const isEdit = Boolean(quoteId);
  const [form, setForm] = useState({
    opportunityId: "",
    companyId: "",
    eventDate: "",
    validUntil: "",
    eventType: "",
    roomId: "",
    attendees: "",
    taxRate: 0.19,
    notes: "",
    internalNotes: "",
    items: []
  });
  const [companies, setCompanies] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([
      companiesApi.list({ limit: 200 }),
      roomsApi.list(),
      servicesApi.list({ limit: 200 })
    ]).then(([c, r, s]) => {
      setCompanies(c.data || []);
      setRooms(r.data || []);
      setServices(s.data || []);
    }).catch(() => {
    });
  }, []);
  useEffect(() => {
    if (form.companyId) {
      companiesApi.listOpportunities(form.companyId, { limit: 50 }).then((res) => setOpportunities(res.data || [])).catch(() => {
      });
    }
  }, [form.companyId]);
  useEffect(() => {
    if (isEdit) {
      quotesApi.getById(quoteId).then((res) => {
        const q = res.data;
        setForm({
          opportunityId: q.opportunityId || "",
          companyId: q.company?.id || "",
          eventDate: q.eventDate ? q.eventDate.slice(0, 10) : "",
          validUntil: q.validUntil ? q.validUntil.slice(0, 10) : "",
          eventType: q.eventType || "",
          roomId: q.room?.id || "",
          attendees: q.attendees || "",
          taxRate: q.taxRate ?? 0.19,
          notes: q.notes || "",
          internalNotes: q.internalNotes || "",
          items: q.items.map((i) => ({
            description: i.description,
            category: i.category,
            serviceId: i.service?.id || "",
            quantity: i.quantity,
            unitPrice: i.unitPrice
          }))
        });
      }).catch(() => {
      });
    }
  }, [quoteId]);
  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const setItem = (idx, field, value) => {
    setForm((f) => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...f, items };
    });
  };
  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));
  const removeItem = (idx) => setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  const subtotal = form.items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0);
  const taxAmount = subtotal * (Number(form.taxRate) || 0);
  const total = subtotal + taxAmount;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        attendees: form.attendees ? Number(form.attendees) : void 0,
        eventDate: form.eventDate ? new Date(form.eventDate).toISOString() : void 0,
        validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : void 0,
        items: form.items.map((i) => ({
          description: i.description,
          category: i.category,
          serviceId: i.serviceId || void 0,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice)
        }))
      };
      if (isEdit) {
        await quotesApi.update(quoteId, payload);
      } else {
        await quotesApi.create(payload);
      }
      onSaved?.();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
    error && /* @__PURE__ */ jsx(Alert, { type: "error", message: error, onClose: () => setError("") }),
    /* @__PURE__ */ jsxs("div", { className: "form-grid-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
        /* @__PURE__ */ jsxs("label", { className: "input-label", children: [
          "Empresa ",
          /* @__PURE__ */ jsx("span", { className: "input-required", children: "*" })
        ] }),
        /* @__PURE__ */ jsxs("select", { className: "input-control", value: form.companyId, onChange: (e) => set("companyId", e.target.value), required: true, children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Seleccionar..." }),
          companies.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.name }, c.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
        /* @__PURE__ */ jsx("label", { className: "input-label", children: "Oportunidad" }),
        /* @__PURE__ */ jsxs("select", { className: "input-control", value: form.opportunityId, onChange: (e) => set("opportunityId", e.target.value), children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Ninguna" }),
          opportunities.map((o) => /* @__PURE__ */ jsx("option", { value: o._id || o.id, children: o.eventType || o._id }, o._id || o.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
        /* @__PURE__ */ jsx("label", { className: "input-label", children: "Fecha del evento" }),
        /* @__PURE__ */ jsx("input", { className: "input-control", type: "date", value: form.eventDate, onChange: (e) => set("eventDate", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
        /* @__PURE__ */ jsx("label", { className: "input-label", children: "Válida hasta" }),
        /* @__PURE__ */ jsx("input", { className: "input-control", type: "date", value: form.validUntil, onChange: (e) => set("validUntil", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
        /* @__PURE__ */ jsx("label", { className: "input-label", children: "Tipo de evento" }),
        /* @__PURE__ */ jsx("input", { className: "input-control", value: form.eventType, onChange: (e) => set("eventType", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
        /* @__PURE__ */ jsx("label", { className: "input-label", children: "Salón" }),
        /* @__PURE__ */ jsxs("select", { className: "input-control", value: form.roomId, onChange: (e) => set("roomId", e.target.value), children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Sin salón" }),
          rooms.map((r) => /* @__PURE__ */ jsx("option", { value: r.id, children: r.name }, r.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
        /* @__PURE__ */ jsx("label", { className: "input-label", children: "Asistentes" }),
        /* @__PURE__ */ jsx("input", { className: "input-control", type: "number", min: "1", value: form.attendees, onChange: (e) => set("attendees", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
        /* @__PURE__ */ jsx("label", { className: "input-label", children: "IVA (%)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            className: "input-control",
            type: "number",
            min: "0",
            max: "100",
            step: "1",
            value: Math.round(form.taxRate * 100),
            onChange: (e) => set("taxRate", Number(e.target.value) / 100)
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { margin: "var(--space-5) 0 var(--space-3)" }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }, children: [
        /* @__PURE__ */ jsx("strong", { style: { fontSize: "var(--text-sm)" }, children: "Ítems de la cotización" }),
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: addItem, children: "+ Agregar ítem" })
      ] }),
      form.items.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-muted", style: { textAlign: "center", padding: "var(--space-4)" }, children: 'No hay ítems. Haz clic en "Agregar ítem".' }),
      form.items.map((item, idx) => /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: "var(--space-2)", alignItems: "end", marginBottom: "var(--space-2)" }, children: [
        /* @__PURE__ */ jsxs("div", { className: "input-field", style: { marginBottom: 0 }, children: [
          idx === 0 && /* @__PURE__ */ jsx("label", { className: "input-label", children: "Descripción" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: "input-control",
              placeholder: "Descripción",
              value: item.description,
              onChange: (e) => setItem(idx, "description", e.target.value),
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "input-field", style: { marginBottom: 0 }, children: [
          idx === 0 && /* @__PURE__ */ jsx("label", { className: "input-label", children: "Categoría" }),
          /* @__PURE__ */ jsx("select", { className: "input-control", value: item.category, onChange: (e) => setItem(idx, "category", e.target.value), children: ITEM_CATEGORIES.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, c)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "input-field", style: { marginBottom: 0 }, children: [
          idx === 0 && /* @__PURE__ */ jsx("label", { className: "input-label", children: "Cantidad" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: "input-control",
              type: "number",
              min: "1",
              value: item.quantity,
              onChange: (e) => setItem(idx, "quantity", e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "input-field", style: { marginBottom: 0 }, children: [
          idx === 0 && /* @__PURE__ */ jsx("label", { className: "input-label", children: "Precio unit." }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: "input-control",
              type: "number",
              min: "0",
              step: "1000",
              value: item.unitPrice,
              onChange: (e) => setItem(idx, "unitPrice", e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "link-btn link-btn--danger",
            style: { marginBottom: "var(--space-1)", paddingBottom: "var(--space-2)" },
            onClick: () => removeItem(idx),
            children: "✕"
          }
        )
      ] }, idx)),
      form.items.length > 0 && /* @__PURE__ */ jsxs("div", { style: { textAlign: "right", marginTop: "var(--space-4)", fontSize: "var(--text-sm)", lineHeight: 2 }, children: [
        /* @__PURE__ */ jsxs("div", { children: [
          "Subtotal: ",
          /* @__PURE__ */ jsx("strong", { children: formatCurrency(subtotal) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          "IVA (",
          Math.round(form.taxRate * 100),
          "%): ",
          /* @__PURE__ */ jsx("strong", { children: formatCurrency(taxAmount) })
        ] }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: "var(--text-base)" }, children: /* @__PURE__ */ jsxs("strong", { children: [
          "Total: ",
          formatCurrency(total)
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
      /* @__PURE__ */ jsx("label", { className: "input-label", children: "Notas para el cliente" }),
      /* @__PURE__ */ jsx("textarea", { className: "input-control", rows: 3, value: form.notes, onChange: (e) => set("notes", e.target.value) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
      /* @__PURE__ */ jsx("label", { className: "input-label", children: "Notas internas" }),
      /* @__PURE__ */ jsx("textarea", { className: "input-control", rows: 2, value: form.internalNotes, onChange: (e) => set("internalNotes", e.target.value) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "form-actions", children: [
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: onCancel, children: "Cancelar" }),
      /* @__PURE__ */ jsx(Button, { type: "submit", disabled: loading, children: loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear cotización" })
    ] })
  ] });
}

export { QuoteForm as Q };
