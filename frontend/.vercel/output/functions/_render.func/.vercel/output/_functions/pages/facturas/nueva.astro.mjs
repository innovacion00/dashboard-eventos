import { c as createComponent, r as renderComponent, b as renderTemplate } from '../../chunks/astro/server_BcKwslGY.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../../chunks/Layout_BCbbW_HH.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { i as invoicesApi } from '../../chunks/invoices.api_DR-WU0iS.mjs';
import { eventsApi } from '../../chunks/events.api_DmZ8-Dxr.mjs';
import { c as companiesApi } from '../../chunks/companies.api_b-6teDnv.mjs';
import { q as quotesApi } from '../../chunks/quotes.api_5OJtDyrT.mjs';
import { A as Alert } from '../../chunks/Alert_AtUShQUE.mjs';
export { renderers } from '../../renderers.mjs';

const EMPTY = {
  eventId: "",
  companyId: "",
  quoteId: "",
  subtotal: "",
  taxRate: "0.19",
  issueDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  dueDate: "",
  notes: ""
};
function InvoiceForm({ invoiceId }) {
  const [form, setForm] = useState(EMPTY);
  const [events, setEvents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    Promise.all([
      eventsApi.list({ limit: 200 }),
      companiesApi.list({ limit: 200 })
    ]).then(([ev, co]) => {
      setEvents(ev.data || []);
      setCompanies(co.data || []);
    }).catch((e) => setError(e.message));
    if (invoiceId) {
      invoicesApi.getById(invoiceId).then((res) => {
        const d = res.data;
        setForm({
          eventId: d.event?.id || "",
          companyId: d.company?.id || "",
          quoteId: d.quote?.id || "",
          subtotal: String(d.subtotal),
          taxRate: String(d.taxRate),
          issueDate: d.issueDate ? d.issueDate.slice(0, 10) : "",
          dueDate: d.dueDate ? d.dueDate.slice(0, 10) : "",
          notes: d.notes || ""
        });
      }).catch((e) => setError(e.message));
    }
  }, [invoiceId]);
  useEffect(() => {
    if (!form.companyId) {
      setQuotes([]);
      return;
    }
    companiesApi.listOpportunities(form.companyId).catch(() => []).then(() => {
    });
    quotesApi.list({ companyId: form.companyId, limit: 100 }).then((res) => {
      setQuotes((res.data || []).filter((q) => q.status === "APROBADA"));
    }).catch(() => setQuotes([]));
  }, [form.companyId]);
  const handleEventChange = (eventId) => {
    const ev = events.find((e) => e.id === eventId);
    setForm((f) => ({
      ...f,
      eventId,
      companyId: ev?.company?.id || f.companyId,
      subtotal: ev ? String(ev.totalValue || "") : f.subtotal
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        eventId: form.eventId,
        companyId: form.companyId,
        quoteId: form.quoteId || void 0,
        subtotal: parseFloat(form.subtotal),
        taxRate: parseFloat(form.taxRate),
        issueDate: form.issueDate || void 0,
        dueDate: form.dueDate || void 0,
        notes: form.notes || void 0
      };
      if (invoiceId) {
        await invoicesApi.update(invoiceId, payload);
      } else {
        await invoicesApi.create(payload);
      }
      window.location.href = "/facturas";
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  };
  const subtotal = parseFloat(form.subtotal) || 0;
  const taxRate = parseFloat(form.taxRate) || 0;
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const total = Math.round((subtotal + taxAmount) * 100) / 100;
  return /* @__PURE__ */ jsxs("div", { className: "page-container", children: [
    /* @__PURE__ */ jsxs("div", { className: "page-header", children: [
      /* @__PURE__ */ jsx("h1", { className: "page-title", children: invoiceId ? "Editar factura" : "Nueva factura" }),
      /* @__PURE__ */ jsx("a", { href: "/facturas", className: "btn btn-secondary", children: "Cancelar" })
    ] }),
    error && /* @__PURE__ */ jsx(Alert, { type: "error", message: error, onClose: () => setError("") }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, style: { maxWidth: 680 }, children: [
      /* @__PURE__ */ jsxs("div", { className: "form-grid-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
          /* @__PURE__ */ jsxs("label", { className: "input-label", children: [
            "Evento ",
            /* @__PURE__ */ jsx("span", { className: "input-required", children: "*" })
          ] }),
          /* @__PURE__ */ jsxs("select", { className: "select-field", value: form.eventId, onChange: (e) => handleEventChange(e.target.value), required: true, children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Seleccionar evento" }),
            events.map((ev) => /* @__PURE__ */ jsxs("option", { value: ev.id, children: [
              ev.number,
              " — ",
              ev.name
            ] }, ev.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
          /* @__PURE__ */ jsxs("label", { className: "input-label", children: [
            "Empresa ",
            /* @__PURE__ */ jsx("span", { className: "input-required", children: "*" })
          ] }),
          /* @__PURE__ */ jsxs("select", { className: "select-field", value: form.companyId, onChange: (e) => setForm((f) => ({ ...f, companyId: e.target.value })), required: true, children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Seleccionar empresa" }),
            companies.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.name }, c.id))
          ] })
        ] }),
        quotes.length > 0 && /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
          /* @__PURE__ */ jsx("label", { className: "input-label", children: "Cotización aprobada" }),
          /* @__PURE__ */ jsxs("select", { className: "select-field", value: form.quoteId, onChange: (e) => setForm((f) => ({ ...f, quoteId: e.target.value })), children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Sin cotización vinculada" }),
            quotes.map((q) => /* @__PURE__ */ jsxs("option", { value: q.id, children: [
              q.number,
              " — $",
              q.total?.toLocaleString("es-CO")
            ] }, q.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
          /* @__PURE__ */ jsxs("label", { className: "input-label", children: [
            "Subtotal ",
            /* @__PURE__ */ jsx("span", { className: "input-required", children: "*" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: "input",
              type: "number",
              min: "0",
              step: "0.01",
              value: form.subtotal,
              onChange: (e) => setForm((f) => ({ ...f, subtotal: e.target.value })),
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
          /* @__PURE__ */ jsx("label", { className: "input-label", children: "IVA (%)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: "input",
              type: "number",
              min: "0",
              max: "100",
              step: "0.01",
              value: (parseFloat(form.taxRate) * 100).toFixed(0),
              onChange: (e) => setForm((f) => ({ ...f, taxRate: String(parseFloat(e.target.value) / 100) }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
          /* @__PURE__ */ jsx("label", { className: "input-label", children: "Fecha de emisión" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: "input",
              type: "date",
              value: form.issueDate,
              onChange: (e) => setForm((f) => ({ ...f, issueDate: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
          /* @__PURE__ */ jsx("label", { className: "input-label", children: "Fecha de vencimiento" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: "input",
              type: "date",
              value: form.dueDate,
              onChange: (e) => setForm((f) => ({ ...f, dueDate: e.target.value }))
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
        /* @__PURE__ */ jsx("label", { className: "input-label", children: "Notas" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            className: "input",
            rows: 3,
            value: form.notes,
            onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value }))
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "invoice-totals", children: [
        /* @__PURE__ */ jsxs("div", { className: "invoice-total-row", children: [
          /* @__PURE__ */ jsx("span", { children: "Subtotal" }),
          /* @__PURE__ */ jsxs("strong", { children: [
            "$",
            subtotal.toLocaleString("es-CO")
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "invoice-total-row", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "IVA (",
            (taxRate * 100).toFixed(0),
            "%)"
          ] }),
          /* @__PURE__ */ jsxs("strong", { children: [
            "$",
            taxAmount.toLocaleString("es-CO")
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "invoice-total-row invoice-total-final", children: [
          /* @__PURE__ */ jsx("span", { children: "Total" }),
          /* @__PURE__ */ jsxs("strong", { children: [
            "$",
            total.toLocaleString("es-CO")
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "form-actions", children: /* @__PURE__ */ jsx("button", { type: "submit", className: "btn btn-primary", disabled: saving, children: saving ? "Guardando..." : invoiceId ? "Actualizar" : "Crear factura" }) })
    ] })
  ] });
}

const $$Nueva = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Nueva factura" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "InvoiceForm", InvoiceForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/components/invoices/InvoiceForm.jsx", "client:component-export": "InvoiceForm" })} ` })}`;
}, "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/facturas/nueva.astro", void 0);

const $$file = "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/facturas/nueva.astro";
const $$url = "/facturas/nueva";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Nueva,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
