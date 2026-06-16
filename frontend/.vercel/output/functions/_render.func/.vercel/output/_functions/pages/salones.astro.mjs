import { c as createComponent, r as renderComponent, b as renderTemplate } from '../chunks/astro/server_BcKwslGY.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_BCbbW_HH.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { r as roomsApi } from '../chunks/rooms.api_DgCTYlBO.mjs';
import { A as Alert } from '../chunks/Alert_AtUShQUE.mjs';
import { f as formatCurrency } from '../chunks/format_CTgnmbjx.mjs';
export { renderers } from '../renderers.mjs';

const CAPACITY_LABELS = {
  auditorium: "Auditorio",
  school: "Aula",
  uShape: "U-Shape",
  cocktail: "Cóctel",
  banquet: "Banquete"
};
function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    roomsApi.list().then((res) => setRooms(res.data || [])).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "page-container", children: [
    /* @__PURE__ */ jsx("div", { className: "page-header", children: /* @__PURE__ */ jsx("h1", { className: "page-title", children: "Salones" }) }),
    error && /* @__PURE__ */ jsx(Alert, { type: "error", message: error, onClose: () => setError("") }),
    loading ? /* @__PURE__ */ jsx("p", { className: "text-muted", children: "Cargando..." }) : /* @__PURE__ */ jsx("div", { className: "room-grid", children: rooms.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-muted", children: "No hay salones registrados." }) : rooms.map((room) => /* @__PURE__ */ jsxs("div", { className: "room-card", children: [
      /* @__PURE__ */ jsx("h2", { className: "room-name", children: room.name }),
      room.aliases?.length > 0 && /* @__PURE__ */ jsxs("p", { className: "room-aliases", children: [
        "Alias: ",
        room.aliases.join(", ")
      ] }),
      room.description && /* @__PURE__ */ jsx("p", { className: "room-desc", children: room.description }),
      /* @__PURE__ */ jsx("div", { className: "room-capacities", children: Object.entries(CAPACITY_LABELS).map(
        ([key, label]) => room.capacities?.[key] != null ? /* @__PURE__ */ jsxs("div", { className: "room-capacity-item", children: [
          /* @__PURE__ */ jsx("span", { className: "room-capacity-value", children: room.capacities[key] }),
          /* @__PURE__ */ jsx("span", { className: "room-capacity-label", children: label })
        ] }, key) : null
      ) }),
      room.baseRate != null && /* @__PURE__ */ jsxs("p", { className: "room-rate", children: [
        "Tarifa base: ",
        formatCurrency(room.baseRate)
      ] })
    ] }, room._id)) })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Salones" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "RoomList", RoomList, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/components/rooms/RoomList.jsx", "client:component-export": "RoomList" })} ` })}`;
}, "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/salones/index.astro", void 0);

const $$file = "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/salones/index.astro";
const $$url = "/salones";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
