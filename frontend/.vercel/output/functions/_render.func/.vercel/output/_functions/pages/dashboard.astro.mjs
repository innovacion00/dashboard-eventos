import { c as createComponent, r as renderComponent, b as renderTemplate } from '../chunks/astro/server_BcKwslGY.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_BCbbW_HH.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { a as api, A as Alert } from '../chunks/Alert_AtUShQUE.mjs';
/* empty css                                     */
import { f as formatCurrency, b as formatDate } from '../chunks/format_CTgnmbjx.mjs';
export { renderers } from '../renderers.mjs';

const dashboardApi = {
  snapshot: (params = {}) => api.get('/dashboard/snapshot?' + new URLSearchParams(params)),
};

function KPICard({ label, value, sub, alert, variant = "default" }) {
  return /* @__PURE__ */ jsxs("div", { className: `kpi-card kpi-card--${variant} ${alert ? "kpi-card--alert" : ""}`, children: [
    /* @__PURE__ */ jsx("p", { className: "kpi-label", children: label }),
    /* @__PURE__ */ jsx("p", { className: "kpi-value", children: value ?? "—" }),
    sub && /* @__PURE__ */ jsx("p", { className: "kpi-sub", children: sub }),
    alert && /* @__PURE__ */ jsx("p", { className: "kpi-alert-msg", children: alert })
  ] });
}

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const STAGE_LABELS = {
  PROSPECTO_INICIAL: "Prospecto",
  CALIFICADO: "Calificado",
  VISITA_INSPECCION: "Visita",
  COTIZADO: "Cotizado",
  NEGOCIACION: "Negociación",
  APROBADO_PENDIENTE_PAGO: "Aprobado",
  CONFIRMADO: "Confirmado",
  PERDIDO: "Perdido"
};
function DashboardPanel() {
  const now = /* @__PURE__ */ new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.snapshot({ year, month });
      setData(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [year, month]);
  const progressPct = data?.goal?.revenueTarget ? Math.min(100, Math.round(data.sales.confirmedSales / data.goal.revenueTarget * 100)) : 0;
  return /* @__PURE__ */ jsxs("div", { className: "page-container", children: [
    /* @__PURE__ */ jsxs("div", { className: "page-header", children: [
      /* @__PURE__ */ jsx("h1", { className: "page-title", children: "Dashboard ejecutivo" }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "var(--space-2)" }, children: [
        /* @__PURE__ */ jsx("select", { className: "input-control", value: year, onChange: (e) => setYear(Number(e.target.value)), style: { maxWidth: 90 }, children: [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => /* @__PURE__ */ jsx("option", { value: y, children: y }, y)) }),
        /* @__PURE__ */ jsx("select", { className: "input-control", value: month, onChange: (e) => setMonth(Number(e.target.value)), style: { maxWidth: 140 }, children: MONTHS.map((m, i) => /* @__PURE__ */ jsx("option", { value: i + 1, children: m }, i + 1)) })
      ] })
    ] }),
    error && /* @__PURE__ */ jsx(Alert, { type: "error", message: error, onClose: () => setError("") }),
    loading ? /* @__PURE__ */ jsx("p", { className: "text-muted", children: "Cargando datos..." }) : data ? /* @__PURE__ */ jsxs(Fragment, { children: [
      data.alerts.presaleAlert && /* @__PURE__ */ jsx("div", { className: "dashboard-alert", children: "Pipeline ponderado insuficiente: el pipeline no cubre el 60% de la meta. Se requiere más actividad comercial." }),
      data.alerts.overdueTasksCount > 0 && /* @__PURE__ */ jsxs("div", { className: "dashboard-alert dashboard-alert--warning", children: [
        "Hay ",
        data.alerts.overdueTasksCount,
        " tarea(s) vencida(s)."
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "kpi-grid", children: [
        /* @__PURE__ */ jsx(
          KPICard,
          {
            label: "Ventas confirmadas",
            value: formatCurrency(data.sales.confirmedSales),
            sub: `Meta: ${formatCurrency(data.goal?.revenueTarget)}`,
            alert: data.alerts.presaleAlert ? "Alerta de preventa activa" : null
          }
        ),
        /* @__PURE__ */ jsx(
          KPICard,
          {
            label: "Pipeline total",
            value: formatCurrency(data.sales.pipelineTotal),
            sub: `Ponderado: ${formatCurrency(data.sales.pipelineWeighted)}`
          }
        ),
        /* @__PURE__ */ jsx(
          KPICard,
          {
            label: "Brecha",
            value: formatCurrency(data.sales.gap),
            sub: `Cobertura: ${data.sales.coverage != null ? (data.sales.coverage * 100).toFixed(0) + "%" : "Total"}`,
            variant: data.sales.gap === 0 ? "success" : "default"
          }
        ),
        /* @__PURE__ */ jsx(
          KPICard,
          {
            label: "Ticket promedio",
            value: formatCurrency(data.sales.averageTicket),
            sub: `${data.sales.confirmedEventsCount} evento(s) confirmado(s)`
          }
        ),
        /* @__PURE__ */ jsx(KPICard, { label: "Tareas pendientes", value: data.tasks.pending, sub: `${data.tasks.overdue} vencida(s)`, alert: data.tasks.overdue > 0 ? "Revisar tareas vencidas" : null }),
        /* @__PURE__ */ jsx(KPICard, { label: "Oportunidades vencidas", value: data.alerts.overdueOpportunitiesCount, alert: data.alerts.overdueOpportunitiesCount > 0 ? "Requieren atención" : null })
      ] }),
      data.goal && /* @__PURE__ */ jsxs("div", { className: "progress-section", children: [
        /* @__PURE__ */ jsxs("div", { className: "progress-header", children: [
          /* @__PURE__ */ jsx("span", { children: "Avance vs. meta de ingresos" }),
          /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsxs("strong", { children: [
            progressPct,
            "%"
          ] }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "progress-bar", children: /* @__PURE__ */ jsx("div", { className: "progress-fill", style: { width: `${progressPct}%` } }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "dashboard-grid-2", children: [
        data.overdueOpportunities.length > 0 && /* @__PURE__ */ jsxs("section", { className: "dashboard-section", children: [
          /* @__PURE__ */ jsx("h2", { className: "section-title", children: "Oportunidades vencidas" }),
          /* @__PURE__ */ jsx("ul", { className: "dashboard-list", children: data.overdueOpportunities.map((o) => /* @__PURE__ */ jsxs("li", { className: "dashboard-list-item", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("strong", { children: o.companyId?.name || "—" }),
              " — ",
              o.eventType,
              /* @__PURE__ */ jsx("span", { className: "badge badge-neutral", style: { marginLeft: "var(--space-2)" }, children: STAGE_LABELS[o.stage] })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-danger", children: formatDate(o.nextActionAt) })
          ] }, o._id)) })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "dashboard-section", children: [
          /* @__PURE__ */ jsx("h2", { className: "section-title", children: "Actividades recientes" }),
          data.recentActivities.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-muted", children: "Sin actividades en los últimos 30 días." }) : /* @__PURE__ */ jsx("ul", { className: "dashboard-list", children: data.recentActivities.slice(0, 10).map((a) => /* @__PURE__ */ jsxs("li", { className: "dashboard-list-item", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("strong", { children: a.companyId?.name || "—" }),
              " — ",
              a.type,
              /* @__PURE__ */ jsx("span", { className: "text-muted", style: { marginLeft: "var(--space-2)", fontSize: "var(--text-xs)" }, children: a.ownerId?.name })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-muted", children: formatDate(a.date) })
          ] }, a._id)) })
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsx("p", { className: "text-muted", children: "No hay datos para este período." })
  ] });
}

const $$Dashboard = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Dashboard" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "DashboardPanel", DashboardPanel, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/components/dashboard/DashboardPanel.jsx", "client:component-export": "DashboardPanel" })} ` })}`;
}, "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/dashboard.astro", void 0);

const $$file = "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/dashboard.astro";
const $$url = "/dashboard";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Dashboard,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
