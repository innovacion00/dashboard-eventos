import { c as createComponent, r as renderComponent, b as renderTemplate, a as createAstro } from '../../chunks/astro/server_BcKwslGY.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../../chunks/Layout_BCbbW_HH.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { c as companiesApi } from '../../chunks/companies.api_b-6teDnv.mjs';
import { a as api, A as Alert } from '../../chunks/Alert_AtUShQUE.mjs';
import { B as Button } from '../../chunks/Button_BuSRxPWM.mjs';
import { M as Modal } from '../../chunks/Modal_FzQIQuvI.mjs';
import { C as CompanyForm } from '../../chunks/CompanyForm_CQHp8va2.mjs';
import { I as Input } from '../../chunks/Input_BTByMfUX.mjs';
import { a as activitiesApi } from '../../chunks/activities.api_CNBPrJiM.mjs';
import { c as catalogsApi } from '../../chunks/catalogs.api_JwOBjRKW.mjs';
import { S as Select } from '../../chunks/Select_D-st_0vo.mjs';
import { f as formatCurrency, b as formatDate } from '../../chunks/format_CTgnmbjx.mjs';
export { renderers } from '../../renderers.mjs';

const contactsApi = {
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.patch(`/contacts/${id}`, data),
  remove: (id) => api.delete(`/contacts/${id}`),
};

function ContactForm({ companyId, onSaved, onCancel }) {
  const [form, setForm] = useState({ fullName: "", position: "", email: "", phone: "", notes: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const validate = () => {
    const err = {};
    if (!form.fullName.trim()) err.fullName = "El nombre es obligatorio";
    setErrors(err);
    return Object.keys(err).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      setApiError("");
      await contactsApi.create({ ...form, companyId });
      onSaved();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, noValidate: true, children: [
    apiError && /* @__PURE__ */ jsx(Alert, { type: "error", message: apiError, onClose: () => setApiError("") }),
    /* @__PURE__ */ jsx(Input, { id: "fullName", label: "Nombre completo", value: form.fullName, onChange: set("fullName"), error: errors.fullName, required: true }),
    /* @__PURE__ */ jsx(Input, { id: "position", label: "Cargo", value: form.position, onChange: set("position") }),
    /* @__PURE__ */ jsx(Input, { id: "email", label: "Correo", type: "email", value: form.email, onChange: set("email") }),
    /* @__PURE__ */ jsx(Input, { id: "phone", label: "Teléfono", value: form.phone, onChange: set("phone") }),
    /* @__PURE__ */ jsxs("div", { className: "form-actions", children: [
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: onCancel, children: "Cancelar" }),
      /* @__PURE__ */ jsx(Button, { type: "submit", loading, children: "Guardar contacto" })
    ] })
  ] });
}

function ActivityForm({ companyId, onSaved, onCancel }) {
  const [form, setForm] = useState({
    type: "",
    result: "",
    date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 16),
    nextActionDescription: "",
    nextActionAt: ""
  });
  const [types, setTypes] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    catalogsApi.list("ACTIVITY_TYPE").then((res) => {
      setTypes((res.data || []).map((c) => ({ value: c.code, label: c.label })));
    }).catch(() => {
    });
  }, []);
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const validate = () => {
    const err = {};
    if (!form.type) err.type = "El tipo es obligatorio";
    if (!form.result.trim()) err.result = "El resultado es obligatorio";
    setErrors(err);
    return Object.keys(err).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      setApiError("");
      const payload = {
        companyId,
        type: form.type,
        result: form.result,
        date: form.date ? new Date(form.date).toISOString() : void 0,
        nextActionDescription: form.nextActionDescription || void 0,
        nextActionAt: form.nextActionAt ? new Date(form.nextActionAt).toISOString() : void 0
      };
      await activitiesApi.create(payload);
      onSaved();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, noValidate: true, children: [
    apiError && /* @__PURE__ */ jsx(Alert, { type: "error", message: apiError, onClose: () => setApiError("") }),
    /* @__PURE__ */ jsx(Select, { id: "type", label: "Tipo de actividad", value: form.type, onChange: set("type"), options: types, placeholder: "Selecciona el tipo", error: errors.type, required: true }),
    /* @__PURE__ */ jsx(Input, { id: "date", label: "Fecha y hora", type: "datetime-local", value: form.date, onChange: set("date") }),
    /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
      /* @__PURE__ */ jsxs("label", { className: "input-label", htmlFor: "result", children: [
        "Resultado ",
        /* @__PURE__ */ jsx("span", { className: "input-required", children: "*" })
      ] }),
      /* @__PURE__ */ jsx("textarea", { id: "result", className: `input-control ${errors.result ? "input-control--error" : ""}`, rows: 3, value: form.result, onChange: set("result") }),
      errors.result && /* @__PURE__ */ jsx("span", { className: "input-error", role: "alert", children: errors.result })
    ] }),
    /* @__PURE__ */ jsx(Input, { id: "nextActionDescription", label: "Descripción próxima acción", value: form.nextActionDescription, onChange: set("nextActionDescription") }),
    /* @__PURE__ */ jsx(Input, { id: "nextActionAt", label: "Fecha próxima acción", type: "datetime-local", value: form.nextActionAt, onChange: set("nextActionAt") }),
    /* @__PURE__ */ jsxs("div", { className: "form-actions", children: [
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: onCancel, children: "Cancelar" }),
      /* @__PURE__ */ jsx(Button, { type: "submit", loading, children: "Registrar actividad" })
    ] })
  ] });
}

const STATUS_LABELS = {
  PROSPECTO: "Prospecto",
  CLIENTE_ACTIVO: "Cliente activo",
  CLIENTE_INACTIVO: "Cliente inactivo",
  ALIADO: "Aliado",
  AGENCIA: "Agencia",
  GUBERNAMENTAL: "Gubernamental"
};
function CompanyDetail({ companyId }) {
  const [company, setCompany] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("info");
  const [modal, setModal] = useState(null);
  const load = async () => {
    try {
      setLoading(true);
      const [compRes, conRes, actRes, oppRes] = await Promise.all([
        companiesApi.getById(companyId),
        companiesApi.listContacts(companyId),
        companiesApi.listActivities(companyId),
        companiesApi.listOpportunities(companyId)
      ]);
      setCompany(compRes.data);
      setContacts(conRes.data);
      setActivities(actRes.data);
      setOpportunities(oppRes.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [companyId]);
  const handleDeleteContact = async (contactId) => {
    if (!confirm("¿Eliminar este contacto?")) return;
    try {
      await contactsApi.remove(contactId);
      load();
    } catch (e) {
      setError(e.message);
    }
  };
  if (loading) return /* @__PURE__ */ jsx("div", { className: "page-loading", children: "Cargando..." });
  if (!company) return /* @__PURE__ */ jsx(Alert, { type: "error", message: "Empresa no encontrada" });
  return /* @__PURE__ */ jsxs("div", { className: "page-container", children: [
    error && /* @__PURE__ */ jsx(Alert, { type: "error", message: error, onClose: () => setError("") }),
    /* @__PURE__ */ jsxs("div", { className: "page-header", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "page-title", children: company.name }),
        /* @__PURE__ */ jsx("span", { className: "badge badge-neutral", children: STATUS_LABELS[company.status] || company.status })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "var(--space-3)" }, children: [
        /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => setModal("activity"), children: "Registrar actividad" }),
        /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => setModal("contact"), children: "Nuevo contacto" }),
        /* @__PURE__ */ jsx(Button, { onClick: () => setModal("edit"), children: "Editar empresa" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "tabs", children: ["info", "contactos", "actividades", "oportunidades"].map((tab) => /* @__PURE__ */ jsx("button", { className: `tab-btn ${activeTab === tab ? "tab-btn--active" : ""}`, onClick: () => setActiveTab(tab), children: tab.charAt(0).toUpperCase() + tab.slice(1) }, tab)) }),
    activeTab === "info" && /* @__PURE__ */ jsxs("div", { className: "detail-grid", children: [
      /* @__PURE__ */ jsx(InfoRow, { label: "Segmento", value: company.segment }),
      /* @__PURE__ */ jsx(InfoRow, { label: "NIT / RUT", value: company.taxId }),
      /* @__PURE__ */ jsx(InfoRow, { label: "Ciudad", value: company.location?.city }),
      /* @__PURE__ */ jsx(InfoRow, { label: "País", value: company.location?.country }),
      /* @__PURE__ */ jsx(InfoRow, { label: "Potencial estimado", value: formatCurrency(company.estimatedPotential) }),
      /* @__PURE__ */ jsx(InfoRow, { label: "Responsable", value: company.owner?.name }),
      /* @__PURE__ */ jsx(InfoRow, { label: "Último contacto", value: formatDate(company.lastContactAt) }),
      /* @__PURE__ */ jsx(InfoRow, { label: "Próxima acción", value: formatDate(company.nextActionAt) }),
      /* @__PURE__ */ jsx(InfoRow, { label: "Descripción próxima acción", value: company.nextActionDescription })
    ] }),
    activeTab === "contactos" && /* @__PURE__ */ jsx("div", { children: contacts.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-muted", children: "Sin contactos registrados." }) : /* @__PURE__ */ jsx("ul", { className: "contact-list", children: contacts.map((c) => /* @__PURE__ */ jsxs("li", { className: "contact-item", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("strong", { children: c.fullName }),
        " — ",
        c.position,
        c.email && /* @__PURE__ */ jsxs("span", { children: [
          " · ",
          c.email
        ] }),
        c.phone && /* @__PURE__ */ jsxs("span", { children: [
          " · ",
          c.phone
        ] })
      ] }),
      /* @__PURE__ */ jsx("button", { className: "link-btn link-btn--danger", onClick: () => handleDeleteContact(c._id), children: "Eliminar" })
    ] }, c._id)) }) }),
    activeTab === "actividades" && /* @__PURE__ */ jsx("div", { children: activities.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-muted", children: "Sin actividades registradas." }) : /* @__PURE__ */ jsx("ul", { className: "activity-list", children: activities.map((a) => /* @__PURE__ */ jsxs("li", { className: "activity-item", children: [
      /* @__PURE__ */ jsx("div", { className: "activity-date", children: formatDate(a.date) }),
      /* @__PURE__ */ jsxs("div", { className: "activity-content", children: [
        /* @__PURE__ */ jsx("strong", { children: a.type }),
        /* @__PURE__ */ jsx("p", { children: a.result }),
        a.nextActionDescription && /* @__PURE__ */ jsxs("p", { className: "text-muted", children: [
          "Próxima acción: ",
          a.nextActionDescription,
          " (",
          formatDate(a.nextActionAt),
          ")"
        ] })
      ] })
    ] }, a._id)) }) }),
    activeTab === "oportunidades" && /* @__PURE__ */ jsx("div", { children: opportunities.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-muted", children: "Sin oportunidades registradas." }) : /* @__PURE__ */ jsx("ul", { className: "opportunity-list", children: opportunities.map((o) => /* @__PURE__ */ jsxs("li", { className: "opportunity-item", children: [
      /* @__PURE__ */ jsx("a", { href: `/pipeline/${o._id}`, children: /* @__PURE__ */ jsx("strong", { children: o.eventType }) }),
      /* @__PURE__ */ jsx("span", { className: "badge badge-stage", children: o.stage }),
      /* @__PURE__ */ jsx("span", { children: formatCurrency(o.estimatedValue) })
    ] }, o._id)) }) }),
    /* @__PURE__ */ jsx(Modal, { open: modal === "edit", title: "Editar empresa", onClose: () => setModal(null), children: /* @__PURE__ */ jsx(CompanyForm, { initial: company, onSaved: () => {
      setModal(null);
      load();
    }, onCancel: () => setModal(null) }) }),
    /* @__PURE__ */ jsx(Modal, { open: modal === "contact", title: "Nuevo contacto", onClose: () => setModal(null), size: "sm", children: /* @__PURE__ */ jsx(ContactForm, { companyId, onSaved: () => {
      setModal(null);
      load();
    }, onCancel: () => setModal(null) }) }),
    /* @__PURE__ */ jsx(Modal, { open: modal === "activity", title: "Registrar actividad", onClose: () => setModal(null), children: /* @__PURE__ */ jsx(ActivityForm, { companyId, onSaved: () => {
      setModal(null);
      load();
    }, onCancel: () => setModal(null) }) })
  ] });
}
function InfoRow({ label, value }) {
  return /* @__PURE__ */ jsxs("div", { className: "info-row", children: [
    /* @__PURE__ */ jsx("span", { className: "info-label", children: label }),
    /* @__PURE__ */ jsx("span", { className: "info-value", children: value || "—" })
  ] });
}

const $$Astro = createAstro();
const $$id = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Detalle de empresa" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "CompanyDetail", CompanyDetail, { "companyId": id, "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/components/crm/CompanyDetail.jsx", "client:component-export": "CompanyDetail" })} ` })}`;
}, "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/empresas/[id].astro", void 0);

const $$file = "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/empresas/[id].astro";
const $$url = "/empresas/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
