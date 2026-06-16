import { c as createComponent, r as renderComponent, b as renderTemplate, a as createAstro } from '../../chunks/astro/server_BcKwslGY.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../../chunks/Layout_BCbbW_HH.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { i as invoicesApi } from '../../chunks/invoices.api_DR-WU0iS.mjs';
import { A as Alert } from '../../chunks/Alert_AtUShQUE.mjs';
import { b as formatDate, f as formatCurrency } from '../../chunks/format_CTgnmbjx.mjs';
export { renderers } from '../../renderers.mjs';

const STATUS_LABEL = {
  BORRADOR: "Borrador",
  EMITIDA: "Emitida",
  PAGADA_PARCIAL: "Pago parcial",
  PAGADA_TOTAL: "Pagada",
  ANULADA: "Anulada",
  VENCIDA: "Vencida"
};
const STATUS_VARIANT = {
  BORRADOR: "neutral",
  EMITIDA: "warning",
  PAGADA_PARCIAL: "warning",
  PAGADA_TOTAL: "success",
  ANULADA: "danger",
  VENCIDA: "danger"
};
const NEXT_STATUSES = {
  BORRADOR: ["EMITIDA", "ANULADA"],
  EMITIDA: ["VENCIDA", "ANULADA"],
  PAGADA_PARCIAL: ["VENCIDA", "ANULADA"],
  VENCIDA: ["EMITIDA"]
};
const PAYMENT_METHOD_LABEL = {
  TRANSFERENCIA: "Transferencia",
  EFECTIVO: "Efectivo",
  CHEQUE: "Cheque",
  TARJETA: "Tarjeta",
  OTRO: "Otro"
};
const PAYMENT_TYPES = ["ANTICIPO", "PAGO_PARCIAL", "PAGO_TOTAL", "AJUSTE"];
const PAYMENT_METHODS = ["TRANSFERENCIA", "EFECTIVO", "CHEQUE", "TARJETA", "OTRO"];
const EMPTY_PAYMENT = {
  type: "PAGO_PARCIAL",
  amount: "",
  paymentDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  method: "TRANSFERENCIA",
  reference: "",
  notes: ""
};
function InvoiceDetail({ id }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payment, setPayment] = useState(EMPTY_PAYMENT);
  const [saving, setSaving] = useState(false);
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await invoicesApi.getById(id);
      setInvoice(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [id]);
  const handleStatusChange = async (newStatus) => {
    setError("");
    try {
      await invoicesApi.changeStatus(id, newStatus);
      load();
    } catch (e) {
      setError(e.message);
    }
  };
  const handleAddPayment = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await invoicesApi.addPayment(id, {
        ...payment,
        amount: parseFloat(payment.amount)
      });
      setShowPaymentForm(false);
      setPayment(EMPTY_PAYMENT);
      load();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  };
  const handleCancelPayment = async (paymentId) => {
    if (!confirm("¿Anular este pago?")) return;
    try {
      await invoicesApi.cancelPayment(id, paymentId);
      load();
    } catch (e) {
      setError(e.message);
    }
  };
  if (loading) return /* @__PURE__ */ jsx("p", { className: "text-muted", children: "Cargando..." });
  if (!invoice) return /* @__PURE__ */ jsx("p", { className: "text-muted", children: "Factura no encontrada." });
  const nextStatuses = NEXT_STATUSES[invoice.status] || [];
  const canAddPayment = ["EMITIDA", "PAGADA_PARCIAL"].includes(invoice.status);
  return /* @__PURE__ */ jsxs("div", { className: "page-container", children: [
    /* @__PURE__ */ jsxs("div", { className: "page-header", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "page-title", children: invoice.number }),
        /* @__PURE__ */ jsx("span", { className: `badge badge-${STATUS_VARIANT[invoice.status]}`, style: { marginTop: 4 }, children: STATUS_LABEL[invoice.status] })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }, children: [
        invoice.status === "BORRADOR" && /* @__PURE__ */ jsx("a", { href: `/facturas/${id}/editar`, className: "btn btn-secondary", children: "Editar" }),
        nextStatuses.map((s) => /* @__PURE__ */ jsx("button", { className: "btn btn-primary", onClick: () => handleStatusChange(s), children: STATUS_LABEL[s] }, s))
      ] })
    ] }),
    error && /* @__PURE__ */ jsx(Alert, { type: "error", message: error, onClose: () => setError("") }),
    /* @__PURE__ */ jsxs("div", { className: "detail-grid", children: [
      /* @__PURE__ */ jsxs("div", { className: "info-row", children: [
        /* @__PURE__ */ jsx("span", { children: "Empresa" }),
        /* @__PURE__ */ jsx("strong", { children: invoice.company?.name })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "info-row", children: [
        /* @__PURE__ */ jsx("span", { children: "Evento" }),
        /* @__PURE__ */ jsxs("strong", { children: [
          invoice.event?.number,
          " — ",
          invoice.event?.name
        ] })
      ] }),
      invoice.quote && /* @__PURE__ */ jsxs("div", { className: "info-row", children: [
        /* @__PURE__ */ jsx("span", { children: "Cotización" }),
        /* @__PURE__ */ jsx("strong", { children: invoice.quote.number })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "info-row", children: [
        /* @__PURE__ */ jsx("span", { children: "Fecha emisión" }),
        /* @__PURE__ */ jsx("strong", { children: formatDate(invoice.issueDate) })
      ] }),
      invoice.dueDate && /* @__PURE__ */ jsxs("div", { className: "info-row", children: [
        /* @__PURE__ */ jsx("span", { children: "Vencimiento" }),
        /* @__PURE__ */ jsx("strong", { children: formatDate(invoice.dueDate) })
      ] }),
      invoice.notes && /* @__PURE__ */ jsxs("div", { className: "info-row", children: [
        /* @__PURE__ */ jsx("span", { children: "Notas" }),
        /* @__PURE__ */ jsx("span", { children: invoice.notes })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "invoice-totals", style: { maxWidth: 400, margin: "var(--space-5) 0" }, children: [
      /* @__PURE__ */ jsxs("div", { className: "invoice-total-row", children: [
        /* @__PURE__ */ jsx("span", { children: "Subtotal" }),
        /* @__PURE__ */ jsx("strong", { children: formatCurrency(invoice.subtotal) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "invoice-total-row", children: [
        /* @__PURE__ */ jsxs("span", { children: [
          "IVA (",
          ((invoice.taxRate || 0) * 100).toFixed(0),
          "%)"
        ] }),
        /* @__PURE__ */ jsx("strong", { children: formatCurrency(invoice.taxAmount) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "invoice-total-row invoice-total-final", children: [
        /* @__PURE__ */ jsx("span", { children: "Total" }),
        /* @__PURE__ */ jsx("strong", { children: formatCurrency(invoice.total) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "invoice-total-row", style: { color: "var(--color-success)" }, children: [
        /* @__PURE__ */ jsx("span", { children: "Pagado" }),
        /* @__PURE__ */ jsx("strong", { children: formatCurrency(invoice.paidAmount) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "invoice-total-row", style: { color: invoice.balance > 0 ? "var(--color-danger)" : "var(--color-success)" }, children: [
        /* @__PURE__ */ jsx("span", { children: "Saldo" }),
        /* @__PURE__ */ jsx("strong", { children: formatCurrency(invoice.balance) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { marginTop: "var(--space-6)" }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "var(--space-4)", marginBottom: "var(--space-3)" }, children: [
        /* @__PURE__ */ jsx("h2", { style: { margin: 0, fontSize: "var(--text-lg)" }, children: "Pagos registrados" }),
        canAddPayment && !showPaymentForm && /* @__PURE__ */ jsx("button", { className: "btn btn-primary", style: { fontSize: "var(--text-sm)" }, onClick: () => setShowPaymentForm(true), children: "+ Registrar pago" })
      ] }),
      showPaymentForm && /* @__PURE__ */ jsxs("form", { onSubmit: handleAddPayment, className: "payment-form", children: [
        /* @__PURE__ */ jsxs("div", { className: "form-grid-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
            /* @__PURE__ */ jsx("label", { className: "input-label", children: "Tipo" }),
            /* @__PURE__ */ jsx("select", { className: "select-field", value: payment.type, onChange: (e) => setPayment((p) => ({ ...p, type: e.target.value })), children: PAYMENT_TYPES.map((t) => /* @__PURE__ */ jsx("option", { value: t, children: t.replace("_", " ") }, t)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
            /* @__PURE__ */ jsxs("label", { className: "input-label", children: [
              "Monto ",
              /* @__PURE__ */ jsx("span", { className: "input-required", children: "*" })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: "input",
                type: "number",
                min: "0.01",
                step: "0.01",
                value: payment.amount,
                onChange: (e) => setPayment((p) => ({ ...p, amount: e.target.value })),
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
            /* @__PURE__ */ jsx("label", { className: "input-label", children: "Fecha" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: "input",
                type: "date",
                value: payment.paymentDate,
                onChange: (e) => setPayment((p) => ({ ...p, paymentDate: e.target.value })),
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
            /* @__PURE__ */ jsx("label", { className: "input-label", children: "Método" }),
            /* @__PURE__ */ jsx("select", { className: "select-field", value: payment.method, onChange: (e) => setPayment((p) => ({ ...p, method: e.target.value })), children: PAYMENT_METHODS.map((m) => /* @__PURE__ */ jsx("option", { value: m, children: PAYMENT_METHOD_LABEL[m] }, m)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
            /* @__PURE__ */ jsx("label", { className: "input-label", children: "Referencia" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: "input",
                type: "text",
                value: payment.reference,
                onChange: (e) => setPayment((p) => ({ ...p, reference: e.target.value }))
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-actions", children: [
          /* @__PURE__ */ jsx("button", { type: "button", className: "btn btn-secondary", onClick: () => setShowPaymentForm(false), children: "Cancelar" }),
          /* @__PURE__ */ jsx("button", { type: "submit", className: "btn btn-primary", disabled: saving, children: saving ? "Guardando..." : "Registrar" })
        ] })
      ] }),
      invoice.payments.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-muted", children: "Sin pagos registrados." }) : /* @__PURE__ */ jsxs("table", { className: "table", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { children: "Tipo" }),
          /* @__PURE__ */ jsx("th", { children: "Fecha" }),
          /* @__PURE__ */ jsx("th", { children: "Método" }),
          /* @__PURE__ */ jsx("th", { children: "Referencia" }),
          /* @__PURE__ */ jsx("th", { children: "Monto" }),
          /* @__PURE__ */ jsx("th", { children: "Estado" }),
          /* @__PURE__ */ jsx("th", {})
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: invoice.payments.map((p) => /* @__PURE__ */ jsxs("tr", { style: { opacity: p.status === "ANULADO" ? 0.5 : 1 }, children: [
          /* @__PURE__ */ jsx("td", { children: p.type?.replace("_", " ") }),
          /* @__PURE__ */ jsx("td", { children: formatDate(p.paymentDate) }),
          /* @__PURE__ */ jsx("td", { children: PAYMENT_METHOD_LABEL[p.method] }),
          /* @__PURE__ */ jsx("td", { children: p.reference || "—" }),
          /* @__PURE__ */ jsx("td", { children: formatCurrency(p.amount) }),
          /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", { className: `badge badge-${p.status === "ANULADO" ? "danger" : "success"}`, children: p.status }) }),
          /* @__PURE__ */ jsx("td", { children: p.status !== "ANULADO" && /* @__PURE__ */ jsx("button", { className: "link-btn", style: { color: "var(--color-danger)" }, onClick: () => handleCancelPayment(p.id), children: "Anular" }) })
        ] }, p.id)) })
      ] })
    ] })
  ] });
}

const $$Astro = createAstro();
const $$id = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Factura" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "InvoiceDetail", InvoiceDetail, { "id": id, "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/components/invoices/InvoiceDetail.jsx", "client:component-export": "InvoiceDetail" })} ` })}`;
}, "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/facturas/[id].astro", void 0);

const $$file = "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/facturas/[id].astro";
const $$url = "/facturas/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
