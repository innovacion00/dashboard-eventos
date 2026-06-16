import { c as createComponent, m as maybeRenderHead, d as addAttribute, b as renderTemplate, a as createAstro, e as renderHead, r as renderComponent, f as renderSlot } from './astro/server_BcKwslGY.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                         */

const $$Astro$1 = createAstro();
const $$Sidebar = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Sidebar;
  const navSections = [
    {
      label: "Comercial",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: "\u25A6" },
        { href: "/empresas", label: "Empresas", icon: "\u{1F3E2}" },
        { href: "/pipeline", label: "Pipeline", icon: "\u25C8" },
        { href: "/cotizaciones", label: "Cotizaciones", icon: "\u25E7" },
        { href: "/actividades", label: "Actividades", icon: "\u25CE" },
        { href: "/tareas", label: "Tareas", icon: "\u2713" },
        { href: "/metas", label: "Metas", icon: "\u25C9" }
      ]
    },
    {
      label: "Operativo",
      items: [
        { href: "/eventos", label: "Eventos", icon: "\u25C6" },
        { href: "/salones", label: "Salones", icon: "\u2B21" },
        { href: "/servicios", label: "Servicios", icon: "\u25D1" }
      ]
    },
    {
      label: "Financiero",
      items: [
        { href: "/facturas", label: "Facturas", icon: "\u25E8" },
        { href: "/comisiones", label: "Comisiones", icon: "$" }
      ]
    },
    {
      label: "Administraci\xF3n",
      items: [
        { href: "/usuarios", label: "Usuarios", icon: "\u25FB" },
        { href: "/auditoria", label: "Auditor\xEDa", icon: "\u2261" }
      ]
    }
  ];
  const currentPath = Astro2.url.pathname;
  return renderTemplate`${maybeRenderHead()}<aside class="sidebar" data-astro-cid-k4cmclh2> <div class="sidebar-brand" data-astro-cid-k4cmclh2> <span class="sidebar-brand-icon" data-astro-cid-k4cmclh2>◈</span> <span class="sidebar-brand-text" data-astro-cid-k4cmclh2>GEH Events</span> </div> <nav class="sidebar-nav" aria-label="Navegación principal" data-astro-cid-k4cmclh2> ${navSections.map((section) => renderTemplate`<div class="sidebar-section" data-astro-cid-k4cmclh2> <span class="sidebar-section-label" data-astro-cid-k4cmclh2>${section.label}</span> <ul data-astro-cid-k4cmclh2> ${section.items.map((item) => renderTemplate`<li data-astro-cid-k4cmclh2> <a${addAttribute(item.href, "href")}${addAttribute(`sidebar-link ${currentPath.startsWith(item.href) ? "sidebar-link--active" : ""}`, "class")}${addAttribute(currentPath.startsWith(item.href) ? "page" : void 0, "aria-current")} data-astro-cid-k4cmclh2> <span class="sidebar-link-icon" aria-hidden="true" data-astro-cid-k4cmclh2>${item.icon}</span> <span class="sidebar-link-label" data-astro-cid-k4cmclh2>${item.label}</span> </a> </li>`)} </ul> </div>`)} </nav> </aside> `;
}, "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/components/layout/Sidebar.astro", void 0);

const $$Header = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<header class="header" data-astro-cid-qlfjksao> <div class="header-inner" data-astro-cid-qlfjksao> <div class="header-title" id="page-title" data-astro-cid-qlfjksao></div> <div class="header-actions" data-astro-cid-qlfjksao> <div class="header-user" id="header-user" data-astro-cid-qlfjksao> <span class="header-user-name" id="header-user-name" data-astro-cid-qlfjksao>Cargando...</span> <button class="header-logout-btn" id="logout-btn" type="button" aria-label="Cerrar sesión" data-astro-cid-qlfjksao>
Salir
</button> </div> </div> </div> </header>  `;
}, "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/components/layout/Header.astro", void 0);

const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title = "GEH Events Command Center" } = Astro2.props;
  return renderTemplate`<html lang="es"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description" content="GEH Events Command Center — Hotel Windsor House"><title>${title} | GEH Events</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">${renderHead()}</head> <body> <div class="app-layout"> ${renderComponent($$result, "Sidebar", $$Sidebar, {})} <div class="app-main"> ${renderComponent($$result, "Header", $$Header, {})} <main class="app-content"> ${renderSlot($$result, $$slots["default"])} </main> </div> </div> </body></html>`;
}, "C:/Users/Usuario/Downloads/DASHBOARD-EVENTOS/frontend/src/components/layout/Layout.astro", void 0);

export { $$Layout as $ };
