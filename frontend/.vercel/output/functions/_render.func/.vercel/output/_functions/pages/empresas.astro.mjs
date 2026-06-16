import { c as createComponent, r as renderComponent, b as renderTemplate } from '../chunks/astro/server_BcKwslGY.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_BCbbW_HH.mjs';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { useState, useRef, useEffect } from 'react';
import { c as companiesApi } from '../chunks/companies.api_b-6teDnv.mjs';
import { c as catalogsApi } from '../chunks/catalogs.api_JwOBjRKW.mjs';
import { T as Table } from '../chunks/Table_DlC02kRM.mjs';
import { B as Button } from '../chunks/Button_BuSRxPWM.mjs';
import { A as Alert } from '../chunks/Alert_AtUShQUE.mjs';
import { M as Modal } from '../chunks/Modal_FzQIQuvI.mjs';
import { C as CompanyForm } from '../chunks/CompanyForm_CQHp8va2.mjs';
import * as XLSX from 'xlsx';
import { b as formatDate } from '../chunks/format_CTgnmbjx.mjs';
export { renderers } from '../renderers.mjs';

const VALID_STATUSES = /* @__PURE__ */ new Set(["PROSPECTO", "CLIENTE_ACTIVO", "CLIENTE_INACTIVO", "ALIADO", "AGENCIA", "GUBERNAMENTAL"]);
const COL_MAP = {
  nombre: "name",
  nit: "taxId",
  segmento: "segment",
  estado: "status",
  ciudad: "city",
  pais: "country",
  direccion: "address",
  potencial: "estimatedPotential"
};
function parseRows(rawRows) {
  return rawRows.map((raw, i) => {
    const norm = {};
    for (const [k, v] of Object.entries(raw)) {
      norm[k.toLowerCase().trim()] = v;
    }
    const row = { _rowIndex: i + 2, _errors: [] };
    for (const [colKey, fieldKey] of Object.entries(COL_MAP)) {
      const val = norm[colKey];
      if (val !== void 0 && val !== "") row[fieldKey] = String(val).trim();
    }
    const location = {};
    if (row.city) {
      location.city = row.city;
      delete row.city;
    }
    if (row.country) {
      location.country = row.country;
      delete row.country;
    }
    if (row.address) {
      location.address = row.address;
      delete row.address;
    }
    if (Object.keys(location).length > 0) row.location = location;
    if (row.estimatedPotential !== void 0) {
      const num = parseFloat(row.estimatedPotential);
      if (isNaN(num)) delete row.estimatedPotential;
      else row.estimatedPotential = num;
    }
    if (row.status) {
      const upper = row.status.toUpperCase();
      if (VALID_STATUSES.has(upper)) row.status = upper;
      else delete row.status;
    }
    if (!row.name || row.name.length < 2) row._errors.push("nombre faltante o muy corto");
    if (!row.segment) row._errors.push("segmento faltante");
    return row;
  });
}
function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    ["nombre", "nit", "segmento", "estado", "ciudad", "pais", "direccion", "potencial"],
    ["Hotel Example", "900123456", "Corporativo", "PROSPECTO", "Bogotá", "Colombia", "Calle 123 #45-67", "50000000"]
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Empresas");
  XLSX.writeFile(wb, "plantilla_empresas.xlsx");
}
function CompanyImport({ onImported }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const validRows = rows.filter((r) => r._errors.length === 0);
  const invalidRows = rows.filter((r) => r._errors.length > 0);
  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    setError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json(ws, { defval: "" });
        if (rawRows.length === 0) {
          setError("El archivo está vacío o no tiene filas de datos.");
          return;
        }
        if (rawRows.length > 500) {
          setError("El archivo supera el límite de 500 filas.");
          return;
        }
        setRows(parseRows(rawRows));
        setOpen(true);
      } catch {
        setError("No se pudo leer el archivo. Asegúrese de que sea un .xlsx válido.");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  }
  async function handleImport() {
    if (validRows.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const payload = validRows.map(({ _rowIndex, _errors, ...rest }) => rest);
      const res = await companiesApi.importCompanies(payload);
      setResult(res.data);
      setRows([]);
      onImported?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  function handleClose() {
    setOpen(false);
    setRows([]);
    setResult(null);
    setError("");
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.5rem", alignItems: "center" }, children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "link-btn",
          style: { fontSize: "var(--text-sm)" },
          onClick: downloadTemplate,
          children: "Descargar plantilla"
        }
      ),
      /* @__PURE__ */ jsx(Button, { onClick: () => fileRef.current?.click(), children: "Importar Excel" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          ref: fileRef,
          type: "file",
          accept: ".xlsx,.xls",
          style: { display: "none" },
          onChange: handleFileChange
        }
      )
    ] }),
    /* @__PURE__ */ jsx(Modal, { open, title: "Vista previa de importación", size: "lg", onClose: handleClose, children: /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "var(--space-4)" }, children: [
      error && /* @__PURE__ */ jsx(Alert, { type: "error", message: error, onClose: () => setError("") }),
      result ? /* @__PURE__ */ jsxs("div", { style: { textAlign: "center", padding: "var(--space-8) 0" }, children: [
        /* @__PURE__ */ jsxs("p", { style: { fontSize: "var(--text-xl)", fontWeight: "var(--font-semibold)", color: "var(--color-success)" }, children: [
          "✓ ",
          result.imported,
          " ",
          result.imported === 1 ? "empresa importada" : "empresas importadas"
        ] }),
        /* @__PURE__ */ jsx(Button, { onClick: handleClose, style: { marginTop: "var(--space-4)" }, children: "Cerrar" })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "var(--space-4)", fontSize: "var(--text-sm)" }, children: [
          /* @__PURE__ */ jsxs("span", { style: { color: "var(--color-success)", fontWeight: "var(--font-medium)" }, children: [
            "✓ ",
            validRows.length,
            " listas para importar"
          ] }),
          invalidRows.length > 0 && /* @__PURE__ */ jsxs("span", { style: { color: "var(--color-danger)", fontWeight: "var(--font-medium)" }, children: [
            "✗ ",
            invalidRows.length,
            " con errores (no se importarán)"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { style: { overflowX: "auto", maxHeight: 360, overflowY: "auto" }, children: /* @__PURE__ */ jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "var(--text-xs)" }, children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { style: { background: "var(--color-gray-1)", position: "sticky", top: 0 }, children: [
            /* @__PURE__ */ jsx("th", { style: TH, children: "Fila" }),
            /* @__PURE__ */ jsx("th", { style: TH, children: "Nombre" }),
            /* @__PURE__ */ jsx("th", { style: TH, children: "Segmento" }),
            /* @__PURE__ */ jsx("th", { style: TH, children: "NIT" }),
            /* @__PURE__ */ jsx("th", { style: TH, children: "Ciudad" }),
            /* @__PURE__ */ jsx("th", { style: TH, children: "Estado" }),
            /* @__PURE__ */ jsx("th", { style: TH, children: "Errores" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: rows.map((r) => /* @__PURE__ */ jsxs(
            "tr",
            {
              style: { background: r._errors.length > 0 ? "var(--color-danger-bg)" : void 0 },
              children: [
                /* @__PURE__ */ jsx("td", { style: TD, children: r._rowIndex }),
                /* @__PURE__ */ jsx("td", { style: TD, children: r.name || /* @__PURE__ */ jsx("span", { className: "text-danger", children: "—" }) }),
                /* @__PURE__ */ jsx("td", { style: TD, children: r.segment || /* @__PURE__ */ jsx("span", { className: "text-danger", children: "—" }) }),
                /* @__PURE__ */ jsx("td", { style: TD, children: r.taxId || "—" }),
                /* @__PURE__ */ jsx("td", { style: TD, children: r.location?.city || "—" }),
                /* @__PURE__ */ jsx("td", { style: TD, children: r.status || "PROSPECTO" }),
                /* @__PURE__ */ jsx("td", { style: { ...TD, color: "var(--color-danger)" }, children: r._errors.length > 0 ? r._errors.join(", ") : "" })
              ]
            },
            r._rowIndex
          )) })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "form-actions", children: [
          /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: handleClose, children: "Cancelar" }),
          /* @__PURE__ */ jsx(Button, { onClick: handleImport, disabled: loading || validRows.length === 0, children: loading ? "Importando..." : `Importar ${validRows.length} empresa${validRows.length !== 1 ? "s" : ""}` })
        ] })
      ] })
    ] }) })
  ] });
}
const TH = {
  padding: "6px 8px",
  textAlign: "left",
  fontWeight: "var(--font-semibold)",
  color: "var(--color-text)",
  borderBottom: "1px solid var(--color-border)",
  whiteSpace: "nowrap"
};
const TD = {
  padding: "5px 8px",
  borderBottom: "1px solid var(--color-gray-1)",
  verticalAlign: "middle"
};

const STATUS_LABELS = {
  PROSPECTO: "Prospecto",
  CLIENTE_ACTIVO: "Cliente activo",
  CLIENTE_INACTIVO: "Cliente inactivo",
  ALIADO: "Aliado",
  AGENCIA: "Agencia",
  GUBERNAMENTAL: "Gubernamental"
};
const COLUMNS = [
  { key: "name", label: "Empresa", render: (r) => /* @__PURE__ */ jsx("a", { href: `/empresas/${r.id}`, children: r.name }) },
  { key: "segment", label: "Segmento" },
  { key: "status", label: "Estado", render: (r) => STATUS_LABELS[r.status] || r.status },
  { key: "owner", label: "Responsable", render: (r) => r.owner?.name || "—" },
  { key: "nextActionAt", label: "Próxima acción", render: (r) => formatDate(r.nextActionAt) }
];
function CompanyList() {
  const [companies, setCompanies] = useState([]);
  const [meta, setMeta] = useState(null);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("");
  useEffect(() => {
    catalogsApi.list("SEGMENT").then((res) => setSegments(res.data || [])).catch(() => {
    });
  }, []);
  const load = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.q = search;
      if (statusFilter) params.status = statusFilter;
      if (segmentFilter) params.segment = segmentFilter;
      const res = await companiesApi.list(params);
      setCompanies(res.data);
      setMeta(res.meta);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [search, statusFilter, segmentFilter]);
  return /* @__PURE__ */ jsxs("div", { className: "page-container", children: [
    /* @__PURE__ */ jsxs("div", { className: "page-header", children: [
      /* @__PURE__ */ jsx("h1", { className: "page-title", children: "Empresas" }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "var(--space-3)", alignItems: "center", flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsx(CompanyImport, { onImported: load }),
        /* @__PURE__ */ jsx(Button, { onClick: () => setShowModal(true), children: "Nueva empresa" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "page-filters", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          className: "input-control",
          placeholder: "Buscar empresa...",
          value: search,
          onChange: (e) => setSearch(e.target.value),
          style: { maxWidth: 280 }
        }
      ),
      /* @__PURE__ */ jsxs(
        "select",
        {
          className: "input-control",
          value: segmentFilter,
          onChange: (e) => setSegmentFilter(e.target.value),
          style: { maxWidth: 200 },
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Todos los segmentos" }),
            segments.map((s) => /* @__PURE__ */ jsx("option", { value: s.name, children: s.name }, s.code))
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "select",
        {
          className: "input-control",
          value: statusFilter,
          onChange: (e) => setStatusFilter(e.target.value),
          style: { maxWidth: 180 },
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Todos los estados" }),
            Object.entries(STATUS_LABELS).map(([v, l]) => /* @__PURE__ */ jsx("option", { value: v, children: l }, v))
          ]
        }
      )
    ] }),
    error && /* @__PURE__ */ jsx(Alert, { type: "error", message: error, onClose: () => setError("") }),
    /* @__PURE__ */ jsx(Table, { columns: COLUMNS, rows: companies, loading, emptyText: "No hay empresas registradas" }),
    meta && /* @__PURE__ */ jsxs("p", { className: "table-meta", children: [
      "Mostrando ",
      companies.length,
      " de ",
      meta.total
    ] }),
    /* @__PURE__ */ jsx(Modal, { open: showModal, title: "Nueva empresa", onClose: () => setShowModal(false), children: /* @__PURE__ */ jsx(CompanyForm, { onSaved: () => {
      setShowModal(false);
      load();
    }, onCancel: () => setShowModal(false) }) })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Empresas" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "CompanyList", CompanyList, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/components/crm/CompanyList.jsx", "client:component-export": "CompanyList" })} ` })}`;
}, "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/empresas/index.astro", void 0);

const $$file = "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/pages/empresas/index.astro";
const $$url = "/empresas";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
