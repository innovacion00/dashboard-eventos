import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { c as companiesApi } from './companies.api_b-6teDnv.mjs';
import { c as catalogsApi } from './catalogs.api_JwOBjRKW.mjs';
import { I as Input } from './Input_BTByMfUX.mjs';
import { S as Select } from './Select_D-st_0vo.mjs';
import { B as Button } from './Button_BuSRxPWM.mjs';
import { A as Alert } from './Alert_AtUShQUE.mjs';

const STATUS_OPTIONS = [
  { value: "PROSPECTO", label: "Prospecto" },
  { value: "CLIENTE_ACTIVO", label: "Cliente activo" },
  { value: "CLIENTE_INACTIVO", label: "Cliente inactivo" },
  { value: "ALIADO", label: "Aliado" },
  { value: "AGENCIA", label: "Agencia" },
  { value: "GUBERNAMENTAL", label: "Gubernamental" }
];
function CompanyForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    taxId: initial?.taxId || "",
    segment: initial?.segment || "",
    status: initial?.status || "PROSPECTO",
    estimatedPotential: initial?.estimatedPotential || "",
    location: { city: initial?.location?.city || "", country: initial?.location?.country || "" },
    nextActionDescription: initial?.nextActionDescription || ""
  });
  const [segments, setSegments] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    catalogsApi.list("SEGMENT").then((res) => {
      setSegments((res.data || []).map((c) => ({ value: c.code, label: c.label })));
    }).catch(() => {
    });
  }, []);
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const setLocation = (field) => (e) => setForm((f) => ({ ...f, location: { ...f.location, [field]: e.target.value } }));
  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = "El nombre es obligatorio";
    if (!form.segment) err.segment = "El segmento es obligatorio";
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
        ...form,
        estimatedPotential: form.estimatedPotential ? Number(form.estimatedPotential) : void 0
      };
      if (initial) {
        await companiesApi.update(initial.id, payload);
      } else {
        await companiesApi.create(payload);
      }
      onSaved();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, noValidate: true, children: [
    apiError && /* @__PURE__ */ jsx(Alert, { type: "error", message: apiError, onClose: () => setApiError("") }),
    /* @__PURE__ */ jsx(Input, { id: "name", label: "Nombre de la empresa", value: form.name, onChange: set("name"), error: errors.name, required: true }),
    /* @__PURE__ */ jsx(Input, { id: "taxId", label: "NIT / RUT", value: form.taxId, onChange: set("taxId") }),
    /* @__PURE__ */ jsx(Select, { id: "segment", label: "Segmento", value: form.segment, onChange: set("segment"), options: segments, placeholder: "Selecciona un segmento", error: errors.segment, required: true }),
    /* @__PURE__ */ jsx(Select, { id: "status", label: "Estado comercial", value: form.status, onChange: set("status"), options: STATUS_OPTIONS }),
    /* @__PURE__ */ jsx(Input, { id: "estimatedPotential", label: "Potencial estimado (COP)", type: "number", value: form.estimatedPotential, onChange: set("estimatedPotential") }),
    /* @__PURE__ */ jsx(Input, { id: "city", label: "Ciudad", value: form.location.city, onChange: setLocation("city") }),
    /* @__PURE__ */ jsx(Input, { id: "country", label: "País", value: form.location.country, onChange: setLocation("country") }),
    /* @__PURE__ */ jsx(Input, { id: "nextActionDescription", label: "Descripción próxima acción", value: form.nextActionDescription, onChange: set("nextActionDescription") }),
    /* @__PURE__ */ jsxs("div", { className: "form-actions", children: [
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: onCancel, children: "Cancelar" }),
      /* @__PURE__ */ jsx(Button, { type: "submit", loading, children: initial ? "Guardar cambios" : "Crear empresa" })
    ] })
  ] });
}

export { CompanyForm as C };
