import { c as createComponent, r as renderComponent, b as renderTemplate } from '../chunks/astro/server_BcKwslGY.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_BCbbW_HH.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { A as Alert, a as api } from '../chunks/Alert_AtUShQUE.mjs';
import { T as Table } from '../chunks/Table_DlC02kRM.mjs';
import { a as formatDateTime } from '../chunks/format_CTgnmbjx.mjs';
export { renderers } from '../renderers.mjs';

const ACTION_VARIANT = {
  CREATE: "badge-success",
  UPDATE: "badge-warning",
  DELETE: "badge-danger",
  LOGIN: "badge-neutral",
  STAGE_CHANGE: "badge-warning"
};
const COLUMNS = [
  { key: "createdAt", label: "Fecha", render: (r) => formatDateTime(r.createdAt) },
  { key: "userEmail", label: "Usuario" },
  { key: "module", label: "Módulo" },
  {
    key: "action",
    label: "Acción",
    render: (r) => /* @__PURE__ */ jsx("span", { className: `badge ${ACTION_VARIANT[r.action] || "badge-neutral"}`, children: r.action })
  },
  { key: "entityId", label: "Entidad", render: (r) => r.entityId ? String(r.entityId).slice(-8) : "—" },
  { key: "ip", label: "IP", render: (r) => r.ip || "—" }
];
function AuditList() {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const load = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: 50 });
      if (moduleFilter) params.set("module", moduleFilter);
      const res = await api.get(`/audit-logs?${params}`);
      setLogs(res.data);
      setMeta(res.meta);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [moduleFilter]);
  const MODULES = ["users", "companies", "contacts", "activities", "opportunities", "tasks", "goals"];
  return /* @__PURE__ */ jsxs("div", { className: "page-container", children: [
    /* @__PURE__ */ jsx("div", { className: "page-header", children: /* @__PURE__ */ jsx("h1", { className: "page-title", children: "Auditoría" }) }),
    /* @__PURE__ */ jsx("div", { className: "page-filters", children: /* @__PURE__ */ jsxs("select", { className: "input-control", value: moduleFilter, onChange: (e) => setModuleFilter(e.target.value), style: { maxWidth: 180 }, children: [
      /* @__PURE__ */ jsx("option", { value: "", children: "Todos los módulos" }),
      MODULES.map((m) => /* @__PURE__ */ jsx("option", { value: m, children: m }, m))
    ] }) }),
    error && /* @__PURE__ */ jsx(Alert, { type: "error", message: error, onClose: () => setError("") }),
    /* @__PURE__ */ jsx(Table, { columns: COLUMNS, rows: logs, loading, emptyText: "No hay registros" }),
    meta && /* @__PURE__ */ jsxs("p", { className: "table-meta", children: [
      "Mostrando ",
      logs.length,
      " de ",
      meta.total
    ] })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Auditor\xEDa" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "AuditList", AuditList, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/components/audit/AuditList.jsx", "client:component-export": "AuditList" })} ` })}`;
}, "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/auditoria/index.astro", void 0);

const $$file = "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/auditoria/index.astro";
const $$url = "/auditoria";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
