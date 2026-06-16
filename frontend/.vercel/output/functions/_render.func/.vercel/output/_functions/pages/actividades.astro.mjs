import { c as createComponent, r as renderComponent, b as renderTemplate } from '../chunks/astro/server_BcKwslGY.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_BCbbW_HH.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { a as activitiesApi } from '../chunks/activities.api_CNBPrJiM.mjs';
import { T as Table } from '../chunks/Table_DlC02kRM.mjs';
import { A as Alert } from '../chunks/Alert_AtUShQUE.mjs';
import { a as formatDateTime, b as formatDate } from '../chunks/format_CTgnmbjx.mjs';
export { renderers } from '../renderers.mjs';

const COLUMNS = [
  { key: "date", label: "Fecha", render: (r) => formatDateTime(r.date) },
  { key: "company", label: "Empresa", render: (r) => r.companyId?.name || "—" },
  { key: "type", label: "Tipo" },
  { key: "result", label: "Resultado" },
  { key: "owner", label: "Registrado por", render: (r) => r.ownerId?.name || "—" },
  { key: "nextActionAt", label: "Próxima acción", render: (r) => formatDate(r.nextActionAt) }
];
function ActivityList() {
  const [activities, setActivities] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    activitiesApi.list().then((res) => {
      setActivities(res.data);
      setMeta(res.meta);
    }).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "page-container", children: [
    /* @__PURE__ */ jsx("div", { className: "page-header", children: /* @__PURE__ */ jsx("h1", { className: "page-title", children: "Actividades comerciales" }) }),
    error && /* @__PURE__ */ jsx(Alert, { type: "error", message: error, onClose: () => setError("") }),
    /* @__PURE__ */ jsx(Table, { columns: COLUMNS, rows: activities, loading, emptyText: "No hay actividades registradas" }),
    meta && /* @__PURE__ */ jsxs("p", { className: "table-meta", children: [
      "Mostrando ",
      activities.length,
      " de ",
      meta.total
    ] })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Actividades" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "ActivityList", ActivityList, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/components/activities/ActivityList.jsx", "client:component-export": "ActivityList" })} ` })}`;
}, "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/actividades/index.astro", void 0);

const $$file = "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/actividades/index.astro";
const $$url = "/actividades";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
