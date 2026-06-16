import { jsx, jsxs } from 'react/jsx-runtime';
/* empty css                         */

function Table({ columns, rows, emptyText = "Sin registros", loading }) {
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "table-loading", children: "Cargando..." });
  }
  return /* @__PURE__ */ jsx("div", { className: "table-wrapper", children: /* @__PURE__ */ jsxs("table", { className: "table", children: [
    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { children: columns.map((col) => /* @__PURE__ */ jsx("th", { style: { width: col.width }, children: col.label }, col.key)) }) }),
    /* @__PURE__ */ jsx("tbody", { children: rows.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: columns.length, className: "table-empty", children: emptyText }) }) : rows.map((row, i) => /* @__PURE__ */ jsx("tr", { children: columns.map((col) => /* @__PURE__ */ jsx("td", { children: col.render ? col.render(row) : row[col.key] }, col.key)) }, row.id || i)) })
  ] }) });
}

export { Table as T };
