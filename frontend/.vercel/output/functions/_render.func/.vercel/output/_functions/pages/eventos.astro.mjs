import { c as createComponent, r as renderComponent, b as renderTemplate } from '../chunks/astro/server_BcKwslGY.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_BCbbW_HH.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { eventsApi } from '../chunks/events.api_DmZ8-Dxr.mjs';
import { T as Table } from '../chunks/Table_DlC02kRM.mjs';
import { B as Button } from '../chunks/Button_BuSRxPWM.mjs';
import { A as Alert } from '../chunks/Alert_AtUShQUE.mjs';
import { M as Modal } from '../chunks/Modal_FzQIQuvI.mjs';
import { E as EventForm } from '../chunks/EventForm_DKnC5LnK.mjs';
import { b as formatDate, f as formatCurrency } from '../chunks/format_CTgnmbjx.mjs';
export { renderers } from '../renderers.mjs';

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
const COLUMNS = [
  { key: "number", label: "N°", render: (r) => /* @__PURE__ */ jsx("a", { href: `/eventos/${r.id}`, children: r.number }) },
  { key: "name", label: "Nombre del evento", render: (r) => /* @__PURE__ */ jsx("a", { href: `/eventos/${r.id}`, children: r.name }) },
  { key: "company", label: "Empresa", render: (r) => r.company?.name || "—" },
  { key: "eventDate", label: "Fecha", render: (r) => formatDate(r.eventDate) },
  { key: "room", label: "Salón", render: (r) => r.room?.name || "—" },
  { key: "totalValue", label: "Valor", render: (r) => formatCurrency(r.totalValue) },
  {
    key: "status",
    label: "Estado",
    render: (r) => /* @__PURE__ */ jsx("span", { className: `badge badge-${STATUS_VARIANT[r.status] || "neutral"}`, children: STATUS_LABELS[r.status] || r.status })
  }
];
function EventList() {
  const [events, setEvents] = useState([]);
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
      const res = await eventsApi.list(params);
      setEvents(res.data);
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
      /* @__PURE__ */ jsx("h1", { className: "page-title", children: "Eventos" }),
      /* @__PURE__ */ jsx(Button, { onClick: () => setShowModal(true), children: "Nuevo evento" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "page-filters", children: /* @__PURE__ */ jsxs(
      "select",
      {
        className: "input-control",
        value: statusFilter,
        onChange: (e) => setStatusFilter(e.target.value),
        style: { maxWidth: 200 },
        children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Todos los estados" }),
          Object.entries(STATUS_LABELS).map(([v, l]) => /* @__PURE__ */ jsx("option", { value: v, children: l }, v))
        ]
      }
    ) }),
    error && /* @__PURE__ */ jsx(Alert, { type: "error", message: error, onClose: () => setError("") }),
    /* @__PURE__ */ jsx(Table, { columns: COLUMNS, rows: events, loading, emptyText: "No hay eventos registrados" }),
    meta && /* @__PURE__ */ jsxs("p", { className: "table-meta", children: [
      "Mostrando ",
      events.length,
      " de ",
      meta.total
    ] }),
    /* @__PURE__ */ jsx(Modal, { open: showModal, title: "Nuevo evento", onClose: () => setShowModal(false), children: /* @__PURE__ */ jsx(
      EventForm,
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
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Eventos" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "EventList", EventList, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/components/events/EventList.jsx", "client:component-export": "EventList" })} ` })}`;
}, "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/eventos/index.astro", void 0);

const $$file = "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/eventos/index.astro";
const $$url = "/eventos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
