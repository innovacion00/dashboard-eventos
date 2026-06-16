import { c as createComponent, r as renderComponent, b as renderTemplate } from '../chunks/astro/server_BcKwslGY.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_BCbbW_HH.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { i as invoicesApi } from '../chunks/invoices.api_DR-WU0iS.mjs';
import { A as Alert } from '../chunks/Alert_AtUShQUE.mjs';
import { b as formatDate, f as formatCurrency } from '../chunks/format_CTgnmbjx.mjs';
export { renderers } from '../renderers.mjs';

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
const STATUSES = Object.keys(STATUS_LABEL);
function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [meta, setMeta] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await invoicesApi.list({ status: statusFilter || void 0 });
      setInvoices(res.data || []);
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
  return /* @__PURE__ */ jsxs("div", { className: "page-container", children: [
    /* @__PURE__ */ jsxs("div", { className: "page-header", children: [
      /* @__PURE__ */ jsx("h1", { className: "page-title", children: "Facturas" }),
      /* @__PURE__ */ jsx("a", { href: "/facturas/nueva", className: "btn btn-primary", children: "Nueva factura" })
    ] }),
    error && /* @__PURE__ */ jsx(Alert, { type: "error", message: error, onClose: () => setError("") }),
    /* @__PURE__ */ jsx("div", { className: "page-filters", children: /* @__PURE__ */ jsxs("select", { className: "filter-select", value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), children: [
      /* @__PURE__ */ jsx("option", { value: "", children: "Todos los estados" }),
      STATUSES.map((s) => /* @__PURE__ */ jsx("option", { value: s, children: STATUS_LABEL[s] }, s))
    ] }) }),
    loading ? /* @__PURE__ */ jsx("p", { className: "text-muted", children: "Cargando..." }) : invoices.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-muted", children: "No hay facturas registradas." }) : /* @__PURE__ */ jsxs("table", { className: "table", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { children: "Número" }),
        /* @__PURE__ */ jsx("th", { children: "Empresa" }),
        /* @__PURE__ */ jsx("th", { children: "Evento" }),
        /* @__PURE__ */ jsx("th", { children: "Fecha emisión" }),
        /* @__PURE__ */ jsx("th", { children: "Total" }),
        /* @__PURE__ */ jsx("th", { children: "Pagado" }),
        /* @__PURE__ */ jsx("th", { children: "Saldo" }),
        /* @__PURE__ */ jsx("th", { children: "Estado" }),
        /* @__PURE__ */ jsx("th", {})
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: invoices.map((inv) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("strong", { children: inv.number }) }),
        /* @__PURE__ */ jsx("td", { children: inv.company?.name || "—" }),
        /* @__PURE__ */ jsx("td", { children: inv.event?.number || "—" }),
        /* @__PURE__ */ jsx("td", { children: formatDate(inv.issueDate) }),
        /* @__PURE__ */ jsx("td", { children: formatCurrency(inv.total) }),
        /* @__PURE__ */ jsx("td", { children: formatCurrency(inv.paidAmount) }),
        /* @__PURE__ */ jsx("td", { style: { color: inv.balance > 0 ? "var(--color-danger)" : "var(--color-success)" }, children: formatCurrency(inv.balance) }),
        /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", { className: `badge badge-${STATUS_VARIANT[inv.status]}`, children: STATUS_LABEL[inv.status] }) }),
        /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("a", { href: `/facturas/${inv.id}`, className: "link-btn", children: "Ver" }) })
      ] }, inv.id)) })
    ] }),
    meta && /* @__PURE__ */ jsxs("p", { className: "text-muted", style: { fontSize: "var(--text-xs)", marginTop: "var(--space-3)" }, children: [
      meta.total,
      " registro(s) — Página ",
      meta.page,
      " de ",
      meta.totalPages
    ] })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Facturas" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "InvoiceList", InvoiceList, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/components/invoices/InvoiceList.jsx", "client:component-export": "InvoiceList" })} ` })}`;
}, "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/facturas/index.astro", void 0);

const $$file = "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/facturas/index.astro";
const $$url = "/facturas";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
