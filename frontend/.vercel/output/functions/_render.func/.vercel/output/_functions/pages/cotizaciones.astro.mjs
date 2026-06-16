import { c as createComponent, r as renderComponent, b as renderTemplate } from '../chunks/astro/server_BcKwslGY.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_BCbbW_HH.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { q as quotesApi } from '../chunks/quotes.api_5OJtDyrT.mjs';
import { T as Table } from '../chunks/Table_DlC02kRM.mjs';
import { B as Button } from '../chunks/Button_BuSRxPWM.mjs';
import { A as Alert } from '../chunks/Alert_AtUShQUE.mjs';
import { M as Modal } from '../chunks/Modal_FzQIQuvI.mjs';
import { Q as QuoteForm } from '../chunks/QuoteForm_BULuhm2c.mjs';
import { b as formatDate, f as formatCurrency } from '../chunks/format_CTgnmbjx.mjs';
export { renderers } from '../renderers.mjs';

const STATUS_LABELS = {
  BORRADOR: "Borrador",
  EN_REVISION: "En revisión",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
  VENCIDA: "Vencida"
};
const STATUS_VARIANT = {
  BORRADOR: "neutral",
  EN_REVISION: "warning",
  APROBADA: "success",
  RECHAZADA: "danger",
  VENCIDA: "danger"
};
const COLUMNS = [
  { key: "number", label: "N°", render: (r) => /* @__PURE__ */ jsx("a", { href: `/cotizaciones/${r.id}`, children: r.number }) },
  { key: "company", label: "Empresa", render: (r) => r.company?.name || "—" },
  { key: "eventDate", label: "Fecha evento", render: (r) => formatDate(r.eventDate) },
  { key: "total", label: "Total", render: (r) => formatCurrency(r.total) },
  {
    key: "status",
    label: "Estado",
    render: (r) => /* @__PURE__ */ jsx("span", { className: `badge badge-${STATUS_VARIANT[r.status] || "neutral"}`, children: STATUS_LABELS[r.status] || r.status })
  },
  { key: "createdBy", label: "Creado por", render: (r) => r.createdBy?.name || "—" }
];
function QuoteList() {
  const [quotes, setQuotes] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const load = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await quotesApi.list(params);
      setQuotes(res.data);
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
      /* @__PURE__ */ jsx("h1", { className: "page-title", children: "Cotizaciones" }),
      /* @__PURE__ */ jsx(Button, { onClick: () => setShowModal(true), children: "Nueva cotización" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "page-filters", children: /* @__PURE__ */ jsxs(
      "select",
      {
        className: "input-control",
        value: statusFilter,
        onChange: (e) => setStatusFilter(e.target.value),
        style: { maxWidth: 180 },
        children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Todos los estados" }),
          Object.entries(STATUS_LABELS).map(([v, l]) => /* @__PURE__ */ jsx("option", { value: v, children: l }, v))
        ]
      }
    ) }),
    error && /* @__PURE__ */ jsx(Alert, { type: "error", message: error, onClose: () => setError("") }),
    /* @__PURE__ */ jsx(Table, { columns: COLUMNS, rows: quotes, loading, emptyText: "No hay cotizaciones registradas" }),
    meta && /* @__PURE__ */ jsxs("p", { className: "table-meta", children: [
      "Mostrando ",
      quotes.length,
      " de ",
      meta.total
    ] }),
    /* @__PURE__ */ jsx(Modal, { open: showModal, title: "Nueva cotización", size: "lg", onClose: () => setShowModal(false), children: /* @__PURE__ */ jsx(
      QuoteForm,
      {
        onSaved: () => {
          setShowModal(false);
          load();
        },
        onCancel: () => setShowModal(false)
      }
    ) })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Cotizaciones" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "QuoteList", QuoteList, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/components/quotes/QuoteList.jsx", "client:component-export": "QuoteList" })} ` })}`;
}, "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/cotizaciones/index.astro", void 0);

const $$file = "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/cotizaciones/index.astro";
const $$url = "/cotizaciones";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
