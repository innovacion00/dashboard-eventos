import { c as createComponent, r as renderComponent, b as renderTemplate, a as createAstro } from '../../chunks/astro/server_BcKwslGY.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../../chunks/Layout_BCbbW_HH.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { q as quotesApi } from '../../chunks/quotes.api_5OJtDyrT.mjs';
import { B as Button } from '../../chunks/Button_BuSRxPWM.mjs';
import { A as Alert } from '../../chunks/Alert_AtUShQUE.mjs';
import { M as Modal } from '../../chunks/Modal_FzQIQuvI.mjs';
import { Q as QuoteForm } from '../../chunks/QuoteForm_BULuhm2c.mjs';
import { b as formatDate, f as formatCurrency } from '../../chunks/format_CTgnmbjx.mjs';
export { renderers } from '../../renderers.mjs';

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
const NEXT_STATUSES = {
  BORRADOR: [{ value: "EN_REVISION", label: "Enviar a revisión" }],
  EN_REVISION: [
    { value: "APROBADA", label: "Aprobar" },
    { value: "RECHAZADA", label: "Rechazar" },
    { value: "BORRADOR", label: "Devolver a borrador" }
  ],
  APROBADA: [{ value: "VENCIDA", label: "Marcar como vencida" }],
  RECHAZADA: [{ value: "BORRADOR", label: "Reabrir como borrador" }],
  VENCIDA: []
};
const CATEGORY_LABELS = { SALON: "Salón", AB: "A&B", AV: "AV", OTROS: "Otros" };
function QuoteDetail({ id }) {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const load = async () => {
    try {
      setLoading(true);
      const res = await quotesApi.getById(id);
      setQuote(res.data);
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
      await quotesApi.changeStatus(id, status);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading("");
    }
  };
  if (loading) return /* @__PURE__ */ jsx("p", { className: "page-loading", children: "Cargando cotización..." });
  if (!quote) return /* @__PURE__ */ jsx("p", { className: "page-loading", children: "Cotización no encontrada." });
  const nextStatuses = NEXT_STATUSES[quote.status] || [];
  return /* @__PURE__ */ jsxs("div", { className: "page-container", children: [
    error && /* @__PURE__ */ jsx(Alert, { type: "error", message: error, onClose: () => setError("") }),
    /* @__PURE__ */ jsxs("div", { className: "page-header", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "page-title", children: quote.number }),
        /* @__PURE__ */ jsx("span", { className: `badge badge-${STATUS_VARIANT[quote.status] || "neutral"}`, style: { marginTop: 4 }, children: STATUS_LABELS[quote.status] })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }, children: [
        quote.status === "BORRADOR" && /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => setShowEdit(true), children: "Editar" }),
        nextStatuses.map((ns) => /* @__PURE__ */ jsx(
          Button,
          {
            variant: ns.value === "APROBADA" ? "primary" : "secondary",
            onClick: () => handleStatusChange(ns.value),
            disabled: Boolean(actionLoading),
            children: actionLoading === ns.value ? "..." : ns.label
          },
          ns.value
        ))
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "detail-grid", children: [
      /* @__PURE__ */ jsxs("div", { className: "info-row", children: [
        /* @__PURE__ */ jsx("span", { className: "info-label", children: "Empresa" }),
        /* @__PURE__ */ jsx("span", { className: "info-value", children: quote.company?.name || "—" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "info-row", children: [
        /* @__PURE__ */ jsx("span", { className: "info-label", children: "Fecha del evento" }),
        /* @__PURE__ */ jsx("span", { className: "info-value", children: formatDate(quote.eventDate) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "info-row", children: [
        /* @__PURE__ */ jsx("span", { className: "info-label", children: "Tipo de evento" }),
        /* @__PURE__ */ jsx("span", { className: "info-value", children: quote.eventType || "—" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "info-row", children: [
        /* @__PURE__ */ jsx("span", { className: "info-label", children: "Salón" }),
        /* @__PURE__ */ jsx("span", { className: "info-value", children: quote.room?.name || "—" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "info-row", children: [
        /* @__PURE__ */ jsx("span", { className: "info-label", children: "Asistentes" }),
        /* @__PURE__ */ jsx("span", { className: "info-value", children: quote.attendees || "—" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "info-row", children: [
        /* @__PURE__ */ jsx("span", { className: "info-label", children: "Válida hasta" }),
        /* @__PURE__ */ jsx("span", { className: "info-value", children: formatDate(quote.validUntil) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "info-row", children: [
        /* @__PURE__ */ jsx("span", { className: "info-label", children: "Creado por" }),
        /* @__PURE__ */ jsx("span", { className: "info-value", children: quote.createdBy?.name || "—" })
      ] }),
      quote.approvedBy && /* @__PURE__ */ jsxs("div", { className: "info-row", children: [
        /* @__PURE__ */ jsx("span", { className: "info-label", children: "Aprobado por" }),
        /* @__PURE__ */ jsxs("span", { className: "info-value", children: [
          quote.approvedBy?.name,
          " — ",
          formatDate(quote.approvedAt)
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "panel", style: { marginTop: "var(--space-4)" }, children: [
      /* @__PURE__ */ jsx("div", { className: "section-header", children: /* @__PURE__ */ jsx("span", { className: "section-title", children: "Ítems" }) }),
      /* @__PURE__ */ jsx("div", { style: { padding: "var(--space-4)" }, children: quote.items.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-muted", children: "Sin ítems." }) : /* @__PURE__ */ jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }, children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { style: { background: "var(--color-gray-1)" }, children: [
          /* @__PURE__ */ jsx("th", { style: TH, children: "Descripción" }),
          /* @__PURE__ */ jsx("th", { style: TH, children: "Categoría" }),
          /* @__PURE__ */ jsx("th", { style: { ...TH, textAlign: "right" }, children: "Cantidad" }),
          /* @__PURE__ */ jsx("th", { style: { ...TH, textAlign: "right" }, children: "Precio unit." }),
          /* @__PURE__ */ jsx("th", { style: { ...TH, textAlign: "right" }, children: "Total" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: quote.items.map((item) => /* @__PURE__ */ jsxs("tr", { style: { borderBottom: "1px solid var(--color-gray-1)" }, children: [
          /* @__PURE__ */ jsx("td", { style: TD, children: item.description }),
          /* @__PURE__ */ jsx("td", { style: TD, children: CATEGORY_LABELS[item.category] || item.category }),
          /* @__PURE__ */ jsx("td", { style: { ...TD, textAlign: "right" }, children: item.quantity }),
          /* @__PURE__ */ jsx("td", { style: { ...TD, textAlign: "right" }, children: formatCurrency(item.unitPrice) }),
          /* @__PURE__ */ jsx("td", { style: { ...TD, textAlign: "right" }, children: formatCurrency(item.total) })
        ] }, item.id)) }),
        /* @__PURE__ */ jsxs("tfoot", { children: [
          /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("td", { colSpan: 4, style: { ...TD, textAlign: "right", fontWeight: "var(--font-medium)" }, children: "Subtotal" }),
            /* @__PURE__ */ jsx("td", { style: { ...TD, textAlign: "right" }, children: formatCurrency(quote.subtotal) })
          ] }),
          /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsxs("td", { colSpan: 4, style: { ...TD, textAlign: "right", fontWeight: "var(--font-medium)" }, children: [
              "IVA (",
              Math.round(quote.taxRate * 100),
              "%)"
            ] }),
            /* @__PURE__ */ jsx("td", { style: { ...TD, textAlign: "right" }, children: formatCurrency(quote.taxAmount) })
          ] }),
          /* @__PURE__ */ jsxs("tr", { style: { background: "var(--color-gold-subtle)" }, children: [
            /* @__PURE__ */ jsx("td", { colSpan: 4, style: { ...TD, textAlign: "right", fontWeight: "var(--font-bold)", fontSize: "var(--text-base)" }, children: "TOTAL" }),
            /* @__PURE__ */ jsx("td", { style: { ...TD, textAlign: "right", fontWeight: "var(--font-bold)", fontSize: "var(--text-base)" }, children: formatCurrency(quote.total) })
          ] })
        ] })
      ] }) })
    ] }),
    quote.notes && /* @__PURE__ */ jsxs("div", { className: "panel", style: { padding: "var(--space-4)", marginTop: "var(--space-4)" }, children: [
      /* @__PURE__ */ jsx("p", { className: "input-label", style: { marginBottom: "var(--space-2)" }, children: "Notas para el cliente" }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: "var(--text-sm)", whiteSpace: "pre-wrap" }, children: quote.notes })
    ] }),
    /* @__PURE__ */ jsx(Modal, { open: showEdit, title: "Editar cotización", size: "lg", onClose: () => setShowEdit(false), children: /* @__PURE__ */ jsx(
      QuoteForm,
      {
        quoteId: id,
        onSaved: () => {
          setShowEdit(false);
          load();
        },
        onCancel: () => setShowEdit(false)
      }
    ) })
  ] });
}
const TH = { padding: "8px 12px", textAlign: "left", fontWeight: "var(--font-semibold)", borderBottom: "1px solid var(--color-border)" };
const TD = { padding: "8px 12px", verticalAlign: "middle" };

const $$Astro = createAstro();
const $$id = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Cotizaci\xF3n" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "QuoteDetail", QuoteDetail, { "id": id, "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/components/quotes/QuoteDetail.jsx", "client:component-export": "QuoteDetail" })} ` })}`;
}, "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/cotizaciones/[id].astro", void 0);

const $$file = "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/cotizaciones/[id].astro";
const $$url = "/cotizaciones/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
