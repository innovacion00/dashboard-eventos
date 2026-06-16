import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { eventsApi } from './events.api_DmZ8-Dxr.mjs';
import { c as companiesApi } from './companies.api_b-6teDnv.mjs';
import { r as roomsApi } from './rooms.api_DgCTYlBO.mjs';
import { c as catalogsApi } from './catalogs.api_JwOBjRKW.mjs';
import { B as Button } from './Button_BuSRxPWM.mjs';
import { A as Alert } from './Alert_AtUShQUE.mjs';

const SETUP_TYPES = ["AUDITORIO", "ESCUELA", "U_SHAPE", "COCTEL", "BANQUETE"];
const SETUP_LABELS = { AUDITORIO: "Auditorio", ESCUELA: "Escuela", U_SHAPE: "U-Shape", COCTEL: "Coctel", BANQUETE: "Banquete" };
function EventForm({ eventId, onSaved, onCancel }) {
  const isEdit = Boolean(eventId);
  const [form, setForm] = useState({
    companyId: "",
    name: "",
    eventType: "",
    roomId: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    attendees: "",
    setupType: "",
    totalValue: "",
    notes: ""
  });
  const [companies, setCompanies] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([
      companiesApi.list({ limit: 200 }),
      roomsApi.list(),
      catalogsApi.list("EVENT_TYPE")
    ]).then(([c, r, et]) => {
      setCompanies(c.data || []);
      setRooms(r.data || []);
      setEventTypes(et.data || []);
    }).catch(() => {
    });
    if (isEdit) {
      eventsApi.getById(eventId).then((res) => {
        const ev = res.data;
        setForm({
          companyId: ev.company?.id || "",
          name: ev.name || "",
          eventType: ev.eventType || "",
          roomId: ev.room?.id || "",
          eventDate: ev.eventDate ? ev.eventDate.slice(0, 10) : "",
          startTime: ev.startTime || "",
          endTime: ev.endTime || "",
          attendees: ev.attendees || "",
          setupType: ev.setupType || "",
          totalValue: ev.totalValue || "",
          notes: ev.notes || ""
        });
      }).catch(() => {
      });
    }
  }, [eventId]);
  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        eventDate: form.eventDate ? new Date(form.eventDate).toISOString() : void 0,
        attendees: form.attendees ? Number(form.attendees) : void 0,
        totalValue: form.totalValue ? Number(form.totalValue) : void 0,
        startTime: form.startTime || void 0,
        endTime: form.endTime || void 0,
        roomId: form.roomId || void 0,
        setupType: form.setupType || void 0
      };
      if (isEdit) {
        await eventsApi.update(eventId, payload);
      } else {
        await eventsApi.create(payload);
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
          "Empresa ",
          /* @__PURE__ */ jsx("span", { className: "input-required", children: "*" })
        ] }),
        /* @__PURE__ */ jsxs("select", { className: "input-control", value: form.companyId, onChange: (e) => set("companyId", e.target.value), required: true, children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Seleccionar..." }),
          companies.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.name }, c.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
        /* @__PURE__ */ jsxs("label", { className: "input-label", children: [
          "Nombre del evento ",
          /* @__PURE__ */ jsx("span", { className: "input-required", children: "*" })
        ] }),
        /* @__PURE__ */ jsx("input", { className: "input-control", value: form.name, onChange: (e) => set("name", e.target.value), required: true })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
        /* @__PURE__ */ jsx("label", { className: "input-label", children: "Tipo de evento" }),
        /* @__PURE__ */ jsxs("select", { className: "input-control", value: form.eventType, onChange: (e) => set("eventType", e.target.value), children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Sin tipo" }),
          eventTypes.map((et) => /* @__PURE__ */ jsx("option", { value: et.name, children: et.name }, et.code))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
        /* @__PURE__ */ jsx("label", { className: "input-label", children: "Salón" }),
        /* @__PURE__ */ jsxs("select", { className: "input-control", value: form.roomId, onChange: (e) => set("roomId", e.target.value), children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Sin salón" }),
          rooms.map((r) => /* @__PURE__ */ jsx("option", { value: r.id, children: r.name }, r.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
        /* @__PURE__ */ jsxs("label", { className: "input-label", children: [
          "Fecha del evento ",
          /* @__PURE__ */ jsx("span", { className: "input-required", children: "*" })
        ] }),
        /* @__PURE__ */ jsx("input", { className: "input-control", type: "date", value: form.eventDate, onChange: (e) => set("eventDate", e.target.value), required: true })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
        /* @__PURE__ */ jsx("label", { className: "input-label", children: "Montaje" }),
        /* @__PURE__ */ jsxs("select", { className: "input-control", value: form.setupType, onChange: (e) => set("setupType", e.target.value), children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Sin especificar" }),
          SETUP_TYPES.map((s) => /* @__PURE__ */ jsx("option", { value: s, children: SETUP_LABELS[s] }, s))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
        /* @__PURE__ */ jsx("label", { className: "input-label", children: "Hora inicio" }),
        /* @__PURE__ */ jsx("input", { className: "input-control", type: "time", value: form.startTime, onChange: (e) => set("startTime", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
        /* @__PURE__ */ jsx("label", { className: "input-label", children: "Hora fin" }),
        /* @__PURE__ */ jsx("input", { className: "input-control", type: "time", value: form.endTime, onChange: (e) => set("endTime", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
        /* @__PURE__ */ jsx("label", { className: "input-label", children: "Asistentes" }),
        /* @__PURE__ */ jsx("input", { className: "input-control", type: "number", min: "1", value: form.attendees, onChange: (e) => set("attendees", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
        /* @__PURE__ */ jsx("label", { className: "input-label", children: "Valor total" }),
        /* @__PURE__ */ jsx("input", { className: "input-control", type: "number", min: "0", step: "1000", value: form.totalValue, onChange: (e) => set("totalValue", e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "input-field", children: [
      /* @__PURE__ */ jsx("label", { className: "input-label", children: "Notas" }),
      /* @__PURE__ */ jsx("textarea", { className: "input-control", rows: 3, value: form.notes, onChange: (e) => set("notes", e.target.value) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "form-actions", children: [
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: onCancel, children: "Cancelar" }),
      /* @__PURE__ */ jsx(Button, { type: "submit", disabled: loading, children: loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear evento" })
    ] })
  ] });
}

export { EventForm as E };
