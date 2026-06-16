# Planning — GEH Events Command Center

> Sistema de Gestión Comercial y Operativa de Eventos para el Hotel Windsor House.

---

## 1. Visión del proyecto

Construir una plataforma única, modular y escalable que centralice todo el ciclo de vida del negocio de eventos del hotel: desde la captación del cliente potencial hasta el cierre operativo y financiero del evento, pasando por seguimiento comercial, negociación, planificación operativa, facturación, rentabilidad, comisiones y medición de satisfacción.

El objetivo de negocio es **reemplazar el manejo disperso de información** (hojas de cálculo, registros manuales) por una **única fuente de verdad** con **alertas proactivas** que permitan a la dirección anticipar desviaciones frente a las metas de venta.

---

## 2. Objetivos técnicos del proyecto

1. Implementar un **monolito modular** en Node.js + Express.js, con módulos desacoplados por dominio (auth, crm, pipeline, tareas, metas, eventos, etc.).
2. Construir un **frontend en Astro** con islas de React (`.jsx`) para las zonas interactivas, usando CSS plano (sin Tailwind).
3. Persistir información en **MongoDB**, modelando colecciones por agregado de dominio.
4. Implementar **autenticación JWT** y un sistema de **autorización por roles (RBAC)** consistente en todos los módulos (corrigiendo la brecha más importante del sistema actual).
5. Establecer un **registro de auditoría centralizado** desde el día uno, no como añadido posterior.
6. Diseñar las APIs como **REST** con contratos claros, versionadas (`/api/v1/...`).
7. Cubrir el código crítico con **pruebas unitarias y de integración**.

---

## 3. Stack tecnológico

| Capa | Tecnología | Razón |
|---|---|---|
| Frontend | **Astro** + **React (.jsx)** islands | Renderizado rápido por defecto, interactividad puntual con React |
| Estilos | **CSS plano** (CSS Modules o variables CSS) | Sin Tailwind por preferencia del equipo |
| Backend | **Node.js** + **Express.js** | Madurez, ecosistema, rendimiento adecuado |
| Base de datos | **MongoDB** | Flexibilidad para catálogos y documentos anidados (ficha empresa, oportunidades) |
| ODM | **Mongoose** | Validación de esquemas, hooks, populate |
| Auth | **JWT** + **bcrypt** | Estándar de la industria |
| Validación | **Zod** o **Joi** | Validación declarativa de DTOs |
| Logging | **Pino** o **Winston** | Logs estructurados |
| Test | **Vitest** o **Jest** + **Supertest** | Pruebas unitarias y de integración |
| Variables | **dotenv** | Configuración por ambiente |

---

## 4. Actores y roles del sistema

Ocho roles con permisos diferenciados (RBAC obligatorio):

1. **Dirección General / CEO** — Acceso total, define metas.
2. **Gerencia del Hotel** — Supervisión, consulta de usuarios.
3. **Líder Comercial** — Supervisa equipo, ajusta metas.
4. **Ejecutivo Comercial** — Gestión de su cartera y oportunidades.
5. **Coordinación Operativa** — Ejecución de eventos confirmados (fase 2).
6. **Financiero / Cartera** — Facturación, cobros, rentabilidad (fase 3).
7. **Calidad / Experiencia** — Encuestas, NPS (fase 4).
8. **Administrador** — Gestión de usuarios y configuración.

> Más actor externo: **Encuestado** (huésped post-evento) — responde encuestas por enlace personalizado sin cuenta.

---

## 5. Fases del proyecto

El sistema se construye por incrementos. Cada fase debe quedar **funcional, probada y desplegable** antes de pasar a la siguiente.

### Fase 0 — Cimientos (Setup)

> Objetivo: Tener un esqueleto del proyecto que arranque, conecte a MongoDB y autentique usuarios.

- Estructura de carpetas (backend y frontend) según `arquitectura.md`.
- Conexión a MongoDB con Mongoose.
- Sistema de configuración por ambiente (`.env`).
- Middleware base de Express: CORS, body parser, logger, manejo centralizado de errores.
- Modelo de **Usuario** con contraseña cifrada (bcrypt).
- Endpoints de **autenticación** (`POST /auth/login`, `POST /auth/logout`).
- Middleware de autenticación JWT y middleware de autorización por rol.
- Frontend Astro con layout base, ruta de login, contexto de sesión y guard de rutas.
- Registro de auditoría base (modelo + servicio reutilizable).

### Fase 1 — Núcleo comercial (MVP)

> Objetivo: Reproducir y mejorar lo que el sistema actual ya entrega como funcional.

| Módulo | Endpoints | Pantallas |
|---|---|---|
| Usuarios | CRUD restringido a Admin/Dirección | Listado, alta |
| CRM (Empresas) | CRUD + filtros + ficha consolidada | Listado, alta, detalle |
| Contactos | CRUD vinculado a empresa | Embebido en ficha empresa |
| Actividades comerciales | Alta + listado | Listado, formulario |
| Pipeline (Oportunidades) | CRUD + cambio de etapa + historial | Listado, alta, cambio de etapa |
| Tareas | CRUD + ciclo de vida completo | Listado con filtros |
| Metas / Presupuesto | Consulta + creación restringida | Vista por mes + formulario |
| Salones | Catálogo (consulta) | Listado |
| Dashboard | Cálculos de KPIs en tiempo real | Panel ejecutivo |
| Auditoría | Consulta restringida | Listado con filtros |

**Reglas de negocio críticas de esta fase** (todas en `arquitectura.md` y código):

- Probabilidad de cierre por etapa (tabla fija: 10/20/35/50/70/90/100/0%).
- `valor_ponderado = valor_estimado × probabilidad_etapa`. Se recalcula automáticamente.
- Brecha frente a meta nunca negativa.
- Alerta de preventa cuando pipeline ponderado < 60% de la meta.
- Oportunidad vencida = `proxima_accion < hoy` y estado activo.
- Toda creación/edición de empresa, contacto, oportunidad y usuario va a auditoría.

### Fase 2 — Ciclo operativo

> Objetivo: Cerrar el eslabón entre venta y operación.

- Conversión automática **Oportunidad "Confirmado" → Evento operativo**.
- Módulo de **Cotizaciones** (versiones, aprobación interna).
- Módulo de **Eventos Confirmados** (calendario, estado operativo).
- Módulo de **Órdenes Operativas (BEO)** (montaje, menú, A/B, AV, personal, proveedores).
- Catálogo de **Salones** completo (capacidades por montaje, tarifa base).
- Catálogo de **Servicios** (A/B, AV, alquileres).

### Fase 3 — Ciclo financiero

> Objetivo: Cerrar el ciclo económico del negocio.

- **Facturación y Cartera** (anticipos, pagos, saldos, estados).
- **Utilidad por Evento** (ingresos vs costos, margen real vs estimado).
- **Comisiones** (cálculo, validación, aprobación, pago).

### Fase 4 — Calidad y avanzado

> Objetivo: Cerrar el ciclo de satisfacción y agregar inteligencia.

- **Encuestas y NPS** (enlace público sin cuenta, cálculo de NPS).
- **Importación masiva** (empresas, contactos, oportunidades, actividades) con vista previa y reporte.
- **Asistente comercial inteligente** (scoring de oportunidades, recomendaciones, predicción).
- **Multi-sede** (separación lógica por hotel).
- **Notificaciones en tiempo real** (campanita funcional, websockets o polling).

---

## 6. Estrategia de desarrollo

### Orden recomendado dentro del MVP (Fase 1)

1. **Auth + Usuarios + Auditoría** — Sin esto nada más se puede probar de extremo a extremo.
2. **CRM (Empresas + Contactos)** — Base sobre la que se monta todo lo demás.
3. **Actividades** — Depende de Empresas.
4. **Pipeline (Oportunidades)** — Depende de Empresas; introduce reglas de cálculo automático.
5. **Tareas** — Independiente, se puede paralelizar.
6. **Metas** — Independiente.
7. **Catálogo de Salones** — Independiente, simple.
8. **Dashboard** — Va al final porque consume datos de todos los módulos anteriores.

### Principios de desarrollo

- **Vertical slices**: terminar un módulo de punta a punta (modelo → repo → service → controller → ruta → frontend) antes de pasar al siguiente.
- **Contratos primero**: definir el contrato de la API (request/response) antes de escribir el endpoint.
- **Auditoría desde el día uno**, no como añadido.
- **RBAC en cada endpoint sensible**, no solo en metas y usuarios.
- **Validación en frontera**: todo input que entra al backend pasa por validación (Zod/Joi).
- **No exponer modelos directamente**: usar DTOs/respuestas pensadas para el cliente.

---

## 7. Hitos y entregables

| Hito | Entregable | Criterio de aceptación |
|---|---|---|
| H0 | Proyecto inicializado | `npm run dev` arranca backend y frontend; login funcional |
| H1 | CRM operativo | Alta/listado/detalle/edición de empresa con auditoría |
| H2 | Pipeline operativo | Crear oportunidad, cambiar etapa, ver historial, ponderado correcto |
| H3 | Dashboard funcional | KPIs reflejan datos reales; alertas activas |
| H4 | MVP completo | Todos los módulos de Fase 1 operativos; auditoría y RBAC verificados |
| H5 | Ciclo operativo | Conversión Confirmado→Evento; BEO emitible |
| H6 | Ciclo financiero | Facturación, utilidad y comisiones operativas |
| H7 | Calidad + IA | NPS, importaciones y asistente IA activos |

---

## 8. Catálogos predefinidos (a sembrar en BD)

Estos catálogos son **listas cerradas** y se deben sembrar al iniciar el sistema (seed):

- **16 segmentos de mercado**
- **11 tipos de evento**
- **14 tipos de actividad comercial** (llamada, correo, mensaje, visita, inspección, reunión, envío de portafolio, envío de tarifas, seguimiento, registro ante proveedores institucionales, presentación institucional, gestión en procesos públicos, participación en ferias, otro)
- **9 fuentes de origen de cliente**
- **8 etapas del pipeline** (Prospecto inicial, Calificado, Visita/Inspección, Cotizado, Negociación, Aprobado pendiente de pago, Confirmado, Perdido)
- **Estados comerciales de empresa** (Prospecto, Cliente activo, Cliente inactivo, Aliado, Agencia, Gubernamental, etc.)
- **Tipos de beneficiario de comisión** (ejecutivo, freelance, aliado, agencia, otro)
- **Estados de orden operativa, factura, comisión y encuesta** (cuando aplique cada fase)

---

## 9. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Control de acceso por rol incompleto | RBAC obligatorio en cada endpoint desde el día uno; middleware `requireRole(['rol1','rol2'])` |
| Eliminaciones sin validación de relaciones | Borrado lógico (`activo: false`); validar relaciones antes de hard-delete |
| Crecimiento descontrolado de colecciones | Índices desde el modelado; paginación obligatoria en listados |
| Auditoría parcial (lo que pasó hoy) | Hook genérico de auditoría aplicable a cualquier modelo Mongoose |
| Acoplamiento entre módulos | Comunicación entre módulos vía servicios, no vía modelos directos |
| Cambios de catálogo difíciles | Catálogos como colecciones, no como enums hardcoded |
| Periodo de metas fijo | Generación de meta por mes/año dinámico, no fijado en código |
| Operación multi-sede | Diseñar `sedeId` desde el inicio aunque solo haya una sede activa |

---

## 10. Definición de "Hecho" (Definition of Done)

Una funcionalidad se considera terminada cuando:

- [ ] El endpoint del backend está implementado, validado y con autorización por rol.
- [ ] Las operaciones críticas (crear, editar, borrar) están registradas en auditoría.
- [ ] Hay al menos una prueba que cubre el camino feliz y los casos de error principales.
- [ ] La pantalla del frontend consume el endpoint real (no datos mock).
- [ ] Los errores se muestran al usuario en español.
- [ ] La documentación de la ruta (`docs/api.md` o equivalente) está actualizada.
- [ ] El `CHANGELOG.md` registra el cambio.

---

## 11. Convenciones del proyecto

- **Idioma del producto**: español (UI, mensajes de error, validaciones).
- **Idioma del código**: inglés (nombres de variables, funciones, archivos).
- **Naming**:
  - Archivos: `kebab-case` (`opportunity.controller.js`).
  - Variables/funciones: `camelCase`.
  - Clases/Modelos: `PascalCase`.
  - Constantes: `UPPER_SNAKE_CASE`.
- **Rutas API**: `kebab-case` y plural (`/api/v1/opportunities`).
- **Commits**: convencionales (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`).
- **Branches**: `feature/nombre`, `fix/nombre`, `chore/nombre`.

---

## 12. Próximos pasos inmediatos

1. Inicializar el repositorio con la estructura de `arquitectura.md`.
2. Configurar el backend mínimo (Express + Mongoose + dotenv + logger).
3. Configurar el frontend mínimo (Astro + integración React + layout base).
4. Implementar autenticación y el modelo de Usuario.
5. Sembrar catálogos base.
6. Comenzar con el módulo CRM (Empresas).
