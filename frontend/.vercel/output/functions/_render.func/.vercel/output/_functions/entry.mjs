import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_BzH84Yiy.mjs';
import { manifest } from './manifest_CKOYZgUb.mjs';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/actividades.astro.mjs');
const _page2 = () => import('./pages/auditoria.astro.mjs');
const _page3 = () => import('./pages/comisiones.astro.mjs');
const _page4 = () => import('./pages/cotizaciones/_id_.astro.mjs');
const _page5 = () => import('./pages/cotizaciones.astro.mjs');
const _page6 = () => import('./pages/dashboard.astro.mjs');
const _page7 = () => import('./pages/empresas/_id_.astro.mjs');
const _page8 = () => import('./pages/empresas.astro.mjs');
const _page9 = () => import('./pages/eventos/_id_.astro.mjs');
const _page10 = () => import('./pages/eventos.astro.mjs');
const _page11 = () => import('./pages/facturas/nueva.astro.mjs');
const _page12 = () => import('./pages/facturas/_id_.astro.mjs');
const _page13 = () => import('./pages/facturas.astro.mjs');
const _page14 = () => import('./pages/login.astro.mjs');
const _page15 = () => import('./pages/metas.astro.mjs');
const _page16 = () => import('./pages/pipeline.astro.mjs');
const _page17 = () => import('./pages/salones.astro.mjs');
const _page18 = () => import('./pages/servicios.astro.mjs');
const _page19 = () => import('./pages/tareas.astro.mjs');
const _page20 = () => import('./pages/usuarios.astro.mjs');
const _page21 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/actividades/index.astro", _page1],
    ["src/pages/auditoria/index.astro", _page2],
    ["src/pages/comisiones/index.astro", _page3],
    ["src/pages/cotizaciones/[id].astro", _page4],
    ["src/pages/cotizaciones/index.astro", _page5],
    ["src/pages/dashboard.astro", _page6],
    ["src/pages/empresas/[id].astro", _page7],
    ["src/pages/empresas/index.astro", _page8],
    ["src/pages/eventos/[id].astro", _page9],
    ["src/pages/eventos/index.astro", _page10],
    ["src/pages/facturas/nueva.astro", _page11],
    ["src/pages/facturas/[id].astro", _page12],
    ["src/pages/facturas/index.astro", _page13],
    ["src/pages/login.astro", _page14],
    ["src/pages/metas/index.astro", _page15],
    ["src/pages/pipeline/index.astro", _page16],
    ["src/pages/salones/index.astro", _page17],
    ["src/pages/servicios/index.astro", _page18],
    ["src/pages/tareas/index.astro", _page19],
    ["src/pages/usuarios/index.astro", _page20],
    ["src/pages/index.astro", _page21]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = {
    "middlewareSecret": "c9b876e2-892c-40eb-b729-afd10d8593f1",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
