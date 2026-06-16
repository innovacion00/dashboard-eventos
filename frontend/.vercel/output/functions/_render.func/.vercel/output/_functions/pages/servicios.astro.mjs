import { c as createComponent, r as renderComponent, b as renderTemplate } from '../chunks/astro/server_BcKwslGY.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_BCbbW_HH.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { s as servicesApi } from '../chunks/services.api_nY_a1Fxr.mjs';
import { T as Table } from '../chunks/Table_DlC02kRM.mjs';
import { B as Button } from '../chunks/Button_BuSRxPWM.mjs';
import { A as Alert } from '../chunks/Alert_AtUShQUE.mjs';
import { M as Modal } from '../chunks/Modal_FzQIQuvI.mjs';
import { f as formatCurrency } from '../chunks/format_CTgnmbjx.mjs';
export { renderers } from '../renderers.mjs';

const CATEGORY_LABELS = { SALON: "Salón", AB: "A&B", AV: "AV", OTROS: "Otros" };
const CATEGORIES = Object.entries(CATEGORY_LABELS);
const COLUMNS = [
  { key: "name", label: "Nombre" },
  { key: "category", label: "Categoría", render: (r) => CATEGORY_LABELS[r.category] || r.category },
  { key: "unitPrice", label: "Precio", render: (r) => `${formatCurrency(r.unitPrice)} / ${r.unit || "unidad"}` },
  { key: "description", label: "Descripción", render: (r) => r.description || "—" }
];
function ServiceForm({ service, onSaved, onCancel }) {
  const isEdit = Boolean(service);
  const [form, setForm] = useState({
    name: service?.name || "",
    description: service?.description || "",
    category: service?.category || "OTROS",
    unitPrice: service?.unitPrice ?? "",
    unit: service?.unit || "unidad"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (f, v) => setForm((s) => ({ ...s, [f]: v }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = { ...form, unitPrice: Number(form.unitPrice) };
      if (isEdit) {
        await servicesApi.update(service.id, payload);
      } else {
        await servicesApi.create(payload);
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
          "Nombre ",
          /* @__PURE__ */ jsx("span", { className: "input-required", children: "*" })
        ] }),
        /* @__PURE__ */ jsx("input", { className: "input-control", value: form.name, onChange: (e) => set("name", e.target.value), required: true })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
        /* @__PURE__ */ jsxs("label", { className: "input-label", children: [
          "Categoría ",
          /* @__PURE__ */ jsx("span", { className: "input-required", children: "*" })
        ] }),
        /* @__PURE__ */ jsx("select", { className: "input-control", value: form.category, onChange: (e) => set("category", e.target.value), required: true, children: CATEGORIES.map(([v, l]) => /* @__PURE__ */ jsx("option", { value: v, children: l }, v)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
        /* @__PURE__ */ jsxs("label", { className: "input-label", children: [
          "Precio unitario ",
          /* @__PURE__ */ jsx("span", { className: "input-required", children: "*" })
        ] }),
        /* @__PURE__ */ jsx("input", { className: "input-control", type: "number", min: "0", step: "1000", value: form.unitPrice, onChange: (e) => set("unitPrice", e.target.value), required: true })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
        /* @__PURE__ */ jsx("label", { className: "input-label", children: "Unidad" }),
        /* @__PURE__ */ jsx("input", { className: "input-control", value: form.unit, onChange: (e) => set("unit", e.target.value), placeholder: "persona, hora, unidad..." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
      /* @__PURE__ */ jsx("label", { className: "input-label", children: "Descripción" }),
      /* @__PURE__ */ jsx("textarea", { className: "input-control", rows: 2, value: form.description, onChange: (e) => set("description", e.target.value) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "form-actions", children: [
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: onCancel, children: "Cancelar" }),
      /* @__PURE__ */ jsx(Button, { type: "submit", disabled: loading, children: loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear servicio" })
    ] })
  ] });
}
function ServiceList() {
  const [services, setServices] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const load = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      const res = await servicesApi.list(params);
      setServices(res.data);
      setMeta(res.meta);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [categoryFilter]);
  const cols = [
    ...COLUMNS,
    {
      key: "_actions",
      label: "",
      render: (r) => /* @__PURE__ */ jsx("button", { className: "link-btn", onClick: () => {
        setEditing(r);
        setShowModal(true);
      }, children: "Editar" })
    }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "page-container", children: [
    /* @__PURE__ */ jsxs("div", { className: "page-header", children: [
      /* @__PURE__ */ jsx("h1", { className: "page-title", children: "Catálogo de servicios" }),
      /* @__PURE__ */ jsx(Button, { onClick: () => {
        setEditing(null);
        setShowModal(true);
      }, children: "Nuevo servicio" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "page-filters", children: /* @__PURE__ */ jsxs("select", { className: "input-control", value: categoryFilter, onChange: (e) => setCategoryFilter(e.target.value), style: { maxWidth: 180 }, children: [
      /* @__PURE__ */ jsx("option", { value: "", children: "Todas las categorías" }),
      CATEGORIES.map(([v, l]) => /* @__PURE__ */ jsx("option", { value: v, children: l }, v))
    ] }) }),
    error && /* @__PURE__ */ jsx(Alert, { type: "error", message: error, onClose: () => setError("") }),
    /* @__PURE__ */ jsx(Table, { columns: cols, rows: services, loading, emptyText: "No hay servicios registrados" }),
    meta && /* @__PURE__ */ jsxs("p", { className: "table-meta", children: [
      "Mostrando ",
      services.length,
      " de ",
      meta.total
    ] }),
    /* @__PURE__ */ jsx(
      Modal,
      {
        open: showModal,
        title: editing ? "Editar servicio" : "Nuevo servicio",
        onClose: () => {
          setShowModal(false);
          setEditing(null);
        },
        children: /* @__PURE__ */ jsx(
          ServiceForm,
          {
            service: editing,
            onSaved: () => {
              setShowModal(false);
              setEditing(null);
              load();
            },
            onCancel: () => {
              setShowModal(false);
              setEditing(null);
            }
          }
        )
      }
    )
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Servicios" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "ServiceList", ServiceList, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/components/services/ServiceList.jsx", "client:component-export": "ServiceList" })} ` })}`;
}, "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/servicios/index.astro", void 0);

const $$file = "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/servicios/index.astro";
const $$url = "/servicios";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
