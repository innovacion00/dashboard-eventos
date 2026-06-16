# Changelog — GEH Events Command Center

## [0.4.0] 2026-06-16 — Fase 3: Ciclo financiero

### Añadido

**Backend — Módulo Invoices (Facturas):**
- Modelo con pagos embebidos como subdocumentos; pre-save recalcula subtotal/IVA/total/pagado/saldo y auto-actualiza estado.
- Numeración automática: `FAC-YYYY-NNNN`.
- Estados: BORRADOR → EMITIDA → PAGADA_PARCIAL → PAGADA_TOTAL / ANULADA / VENCIDA. Transiciones validadas.
- Solo se editan facturas en BORRADOR. Solo se añaden pagos a facturas EMITIDAS o con pago parcial.
- `POST /:id/payments` — registrar pago; `DELETE /:id/payments/:paymentId` — anular pago.
- RBAC en escritura: FINANCIERO_CARTERA, DIRECCION_GENERAL, ADMINISTRADOR.
- Auditoría en CREATE, UPDATE (incluyendo pagos), DELETE.

**Backend — Módulo EventCosts (Costos de Evento):**
- Costos desglosados por categoría: AB, AV, SALON, PERSONAL, PROVEEDOR, OTRO.
- `GET /event-costs/event/:eventId/summary` — devuelve ingresos, costos reales, margen bruto y % margen.
- RBAC en escritura: FINANCIERO_CARTERA, COORDINACION_OPERATIVA, DIRECCION_GENERAL, ADMINISTRADOR.
- Auditoría en CREATE, UPDATE, DELETE.

**Backend — Módulo Commissions (Comisiones):**
- Numeración automática: `COM-YYYY-NNNN`.
- Pre-save calcula `amount = baseAmount * rate`.
- Estados: CALCULADA → APROBADA → PAGADA / ANULADA. `approvedBy/approvedAt` y `paidAt` se registran automáticamente.
- No se puede eliminar una comisión ya pagada.
- RBAC diferenciado: crear/editar (FINANCIERO_CARTERA, DIRECCION_GENERAL, ADMINISTRADOR); aprobar/pagar (DIRECCION_GENERAL, LIDER_COMERCIAL, ADMINISTRADOR).
- Auditoría en CREATE, UPDATE, DELETE.

**Backend — app.js:**
- Registradas 3 nuevas rutas: `/api/v1/invoices`, `/api/v1/event-costs`, `/api/v1/commissions`.

**Frontend — Clientes API:**
- `invoices.api.js`, `event-costs.api.js`, `commissions.api.js`.

**Frontend — Módulo Facturas:**
- `InvoiceList.jsx`: listado con filtro por estado, saldo coloreado (rojo si pendiente, verde si saldado).
- `InvoiceForm.jsx`: formulario con auto-carga desde evento seleccionado, cálculo en tiempo real de IVA/total.
- `InvoiceDetail.jsx`: ficha completa, tabla de pagos con anulación individual, flujo de estado contextual.
- Páginas `/facturas`, `/facturas/nueva`, `/facturas/[id]`.

**Frontend — Costos de Evento:**
- `EventCostsPanel.jsx`: panel de resumen de rentabilidad (ingresos, costos, margen bruto, %) + tabla de costos CRUD.
- Embebido en `EventDetail.jsx` como nueva pestaña "Costos / Utilidad".

**Frontend — Módulo Comisiones:**
- `CommissionList.jsx`: listado con filtro por estado, acciones de avance de estado (Aprobar / Marcar como pagada), formulario de creación inline.
- Página `/comisiones`.

**Frontend — Sidebar:**
- Nueva sección "Financiero" con items Facturas y Comisiones.

**Frontend — Estilos:**
- `.invoice-totals`, `.invoice-total-row`, `.invoice-total-final`, `.payment-form`.
- `.profitability-summary`, `.profit-card`, `.profit-label`, `.profit-value`.

### Hito alcanzado
- **H6** — Ciclo financiero: Facturación con pagos parciales y anulaciones; Rentabilidad por evento con margen real; Comisiones con flujo de aprobación y pago.

---

## [0.3.1] 2026-06-16 — Salones: datos reales + aliases

### Añadido
- Campo `aliases` (array) en modelo `Room` para registrar nombres alternativos del salón.
- `rooms.seed.js`: siembra los 9 salones del hotel con capacidades reales (Auditorio, Aula, U-Shape) y sus aliases. Idempotente.
- Script `seed:rooms` en `package.json`. El script `seed` ahora incluye rooms automáticamente.

### Modificado
- `RoomList.jsx`: muestra aliases debajo del nombre; capacidades con valor grande (dorado) + etiqueta en uppercase.
- `global.css`: nuevos estilos `.room-aliases`, `.room-capacity-item`, `.room-capacity-value`, `.room-capacity-label`.

**Salones sembrados:** Bond / Bold, Cambridge, London, Oxford, Gales, Kingston, Manchester, Newcastle, Sala de Juntas.

---

## [0.3.0] 2026-06-16 — Fase 2: Ciclo operativo

### Añadido

**Backend — Módulo Services:**
- Catálogo de servicios (A&B, AV, Salón, Otros) con CRUD completo.
- `GET /api/v1/services`, `POST`, `PATCH /:id`, `DELETE /:id` (soft delete).
- RBAC en escritura: DIRECCION_GENERAL, LIDER_COMERCIAL, ADMINISTRADOR.

**Backend — Módulo Quotes (Cotizaciones):**
- Modelo con ítems de línea, cálculo automático de subtotal/IVA/total en pre-save hook.
- Numeración automática: `COT-YYYY-NNNN`.
- Flujo de estados: BORRADOR → EN_REVISION → APROBADA/RECHAZADA/VENCIDA con validación de transiciones.
- Solo se pueden editar cotizaciones en estado BORRADOR.
- No se puede eliminar una cotización aprobada.
- Auditoría en CREATE, UPDATE (incluyendo cambio de estado).

**Backend — Módulo Events (Eventos):**
- Modelo de evento operativo con numeración `EVT-YYYY-NNNN`.
- Conversión automática: al cambiar oportunidad a CONFIRMADO se crea el evento correspondiente (si no existe).
- Estados: CONFIRMADO → EN_PRODUCCION → REALIZADO / CANCELADO / POSPUESTO.
- CRUD completo + `PATCH /:id/status`.
- Auditoría en CREATE y UPDATE.

**Backend — Módulo BEOs (Órdenes Operativas):**
- Un BEO por evento (índice único en eventId).
- Numeración automática: `BEO-YYYY-NNNN`.
- Secciones: setup (montaje), menu (A&B), audiovisual, personal, proveedores, notas generales.
- `issuedAt` se registra automáticamente al emitir.
- Estados: BORRADOR → EMITIDO → CONFIRMADO. BEO confirmado no se puede editar.
- Endpoints: `GET /beos/event/:eventId`, `POST /beos`, `PATCH /:id`, `PATCH /:id/status`.

**Backend — opportunity.service.js:**
- Al ejecutar `changeStage` con `newStage = 'CONFIRMADO'`, llama `eventService.createFromOpportunity()` usando dynamic import para evitar dependencia circular.

**Backend — app.js:**
- Registradas 4 nuevas rutas: `/api/v1/services`, `/api/v1/quotes`, `/api/v1/events`, `/api/v1/beos`.

**Frontend — Clientes API:**
- `quotes.api.js`, `events.api.js`, `beos.api.js`, `services.api.js`.

**Frontend — Módulo Cotizaciones:**
- `QuoteList.jsx`: listado con filtro por estado, badge de estado.
- `QuoteForm.jsx`: formulario con ítems dinámicos, cálculo en tiempo real de subtotal/IVA/total, integración con empresas/oportunidades/salones/servicios.
- `QuoteDetail.jsx`: ficha completa, tabla de ítems, botones de cambio de estado según flujo permitido.
- Páginas `/cotizaciones` y `/cotizaciones/[id]`.

**Frontend — Módulo Eventos:**
- `EventList.jsx`: listado con filtro por estado.
- `EventForm.jsx`: formulario completo con carga dinámica de empresas, salones, tipos de evento.
- `EventDetail.jsx`: ficha con tabs (Información / BEO), cambio de estado contextual.
- Páginas `/eventos` y `/eventos/[id]`.

**Frontend — BEO:**
- `BeoPanel.jsx`: panel embebido en EventDetail, tabs por sección (Montaje, A&B, AV, Personal, Proveedores, Notas), guardado parcial, emisión y confirmación. Se bloquea al confirmar.

**Frontend — Módulo Servicios:**
- `ServiceList.jsx`: catálogo con filtro por categoría, formulario de creación/edición en modal.
- Página `/servicios`.

**Frontend — Sidebar:**
- Reorganizado en tres secciones: Comercial, Operativo, Administración.
- Nuevos ítems: Cotizaciones, Eventos, Servicios.

### Hito alcanzado
- **H5** — Ciclo operativo: conversión Confirmado→Evento automática; Cotizaciones con flujo de aprobación; BEO emitible.

---

Formato: `[Versión] YYYY-MM-DD — Descripción`

---

## [0.1.0] 2026-06-16 — Fase 0: Cimientos

### Añadido

**Estructura del proyecto:**
- Monorepo con paquetes `backend/` y `frontend/`.
- Árbol de carpetas completo para backend (config, core, modules, seeds, tests) y frontend (pages, components, lib, styles).
- `.gitignore` raíz, `package.json` en ambos paquetes.

**Backend — Core:**
- `config/env.js`: carga y validación de variables de entorno con fallo explícito si faltan obligatorias.
- `config/database.js`: conexión Mongoose con logging de estado.
- `config/logger.js`: Pino con pretty-print en desarrollo y JSON en producción.
- Sistema de errores: `AppError`, `ValidationError`, `AuthError`, `NotFoundError`, `ForbiddenError`.
- Utilidades: `asyncHandler`, `response` (successResponse / errorResponse), `paginate` (getPagination / buildMeta).
- Constantes: `roles.js` (8 roles RBAC), `stages.js` (8 etapas con probabilidades fijas).
- Middlewares: `auth.middleware.js` (JWT), `authorize.middleware.js` (requireRole), `error.middleware.js` (centralizado), `validate.middleware.js` (Zod), `request-logger.middleware.js` (pino-http).
- `app.js` con CORS, body parser, request logger, rutas y manejador de errores.
- `server.js` con arranque secuencial (DB → HTTP).

**Backend — Módulo Auth:**
- Modelo `User` con bcrypt (`user.model.js`): 8 roles, estados ACTIVO/INACTIVO/SUSPENDIDO, `lastLoginAt`, `comparePassword()`, `hashPassword()`.
- `POST /api/v1/auth/login` — autentica, genera JWT 8h, registra login en auditoría.
- `POST /api/v1/auth/logout` — registra logout en auditoría.
- `GET /api/v1/auth/me` — devuelve datos del usuario autenticado.
- Validación con Zod en `auth.validation.js`.

**Backend — Módulo Audit:**
- Modelo `AuditLog` (`audit-log.model.js`) con índices en `userId`, `module`, `action`, `createdAt`, `entityId`.
- Servicio `audit()` reutilizable que nunca interrumpe el flujo principal (captura sus propias excepciones).
- `GET /api/v1/audit-logs` con filtros por módulo, acción, usuario y rango de fechas. RBAC: solo `DIRECCION_GENERAL` y `ADMINISTRADOR`.

**Backend — Módulo Catalogs:**
- Modelo `Catalog` con índice único `(type, code)`.
- `GET /api/v1/catalogs?type=X` — devuelve catálogos activos ordenados.

**Backend — Seeds:**
- `catalogs.seed.js`: siembra 16 segmentos, 11 tipos de evento, 14 tipos de actividad, 9 fuentes, 6 estados de empresa, 8 etapas del pipeline (con probabilidad en `metadata`). Idempotente.
- `admin.seed.js`: crea el usuario administrador inicial desde variables de entorno. Idempotente.
- `.env.example` con todas las variables documentadas.

**Frontend:**
- `astro.config.mjs` con integración React y modo SSR.
- `tokens.css`: paleta completa, tipografía, espaciado, sombras, radios, transiciones.
- `global.css`: reset moderno, layout base (sidebar fijo + main desplazado).
- `middleware.ts`: protege todas las rutas excepto `/login`; redirige al dashboard si ya hay token.
- `src/lib/auth/session.js`: guardar/leer/borrar token en localStorage + cookie para SSR.
- `src/lib/auth/guard.js`: helpers `requireAuth()`, `redirectIfAuthenticated()`, `handleUnauthorized()`.
- `src/lib/api/client.js`: fetch wrapper con JWT, manejo de 401 automático, objeto `api` (get/post/patch/delete).
- `src/lib/api/auth.api.js`: cliente para los 3 endpoints de auth.
- `src/lib/utils/format.js`: formateo de moneda, fecha y porcentaje en `es-CO`.
- Componentes de layout: `Layout.astro`, `Sidebar.astro`, `Header.astro` con logout funcional.
- Componentes UI: `Button.jsx`, `Input.jsx`, `Alert.jsx` con sus estilos CSS.
- `LoginForm.jsx`: formulario React que consume `POST /auth/login`, guarda sesión y redirige.
- `DashboardWelcome.jsx`: placeholder que muestra "Bienvenido, {nombre}" leyendo `GET /auth/me`.
- Páginas: `index.astro` (redirige a `/dashboard`), `login.astro`, `dashboard.astro`.
- `.env.example` con `PUBLIC_API_URL`.

**Documentación:**
- `docs/api.md`: endpoints de Auth, Catalogs y Audit documentados.
- `docs/changelog.md`: este archivo.
- `README.md`: instrucciones completas de arranque local.

### Pendiente para cerrar Fase 0 (Hito H0)
- Instalar dependencias (`npm install` en backend y frontend).
- Copiar `.env.example` a `.env` y configurar variables.
- Levantar MongoDB local.
- Correr seeds.
- Verificar `npm run dev` en ambos paquetes.
- Probar login con el admin sembrado.

---

## [0.2.0] 2026-06-16 — Fase 1: Núcleo comercial (MVP)

### Añadido

**Backend — Módulo Users:**
- `user.repository.js`, `user.service.js`, `user.controller.js`, `user.routes.js`, `user.validation.js`.
- CRUD completo (`GET /`, `POST /`, `GET /:id`, `PATCH /:id`).
- RBAC: listado solo para `DIRECCION_GENERAL`, `GERENCIA_HOTEL`, `ADMINISTRADOR`; creación/edición solo para `DIRECCION_GENERAL` y `ADMINISTRADOR`.
- Auditoría en CREATE y UPDATE.

**Backend — Módulo Companies:**
- Modelo `Company` con índices en `name` (text), `segment`, `status`, `ownerId`.
- CRUD completo + soft delete validando relaciones activas.
- Sub-recursos: `GET /:id/contacts`, `GET /:id/activities`, `GET /:id/opportunities`.
- `ownerId` se fija al usuario autenticado al crear.
- RBAC para DELETE: solo `DIRECCION_GENERAL`, `LIDER_COMERCIAL`, `ADMINISTRADOR`.

**Backend — Módulo Contacts:**
- Modelo `Contact` vinculado a `Company`.
- `POST /contacts`, `PATCH /:id`, `DELETE /:id` (soft delete).
- Auditoría en CREATE, UPDATE, DELETE.

**Backend — Módulo Activities:**
- Modelo `Activity` con relación a empresa, contacto (opcional) y oportunidad (opcional).
- `GET /activities`, `POST /activities`.
- Al registrar actividad con próxima acción, **reemplaza** la de la empresa (regla de negocio).
- Auditoría en CREATE.

**Backend — Módulo Opportunities:**
- Modelo `Opportunity` con hook `pre('save')` que recalcula `probability` y `weightedValue` al cambiar `stage` o `estimatedValue`.
- Modelo `OpportunityHistory` para historial de cambios de etapa.
- Endpoints: `GET /`, `POST /`, `GET /:id`, `PATCH /:id`, `PATCH /:id/stage`, `GET /:id/history`.
- Endpoint dedicado `/stage` que registra historia + auditoría con acción `STAGE_CHANGE`.
- `isOverdue` calculado en el mapeo de respuesta.

**Backend — Módulo Tasks:**
- Modelo `Task` con prioridades, estados y entidad relacionada opcional.
- CRUD + cambio de estado (`PATCH /:id/status`).
- Al completar una tarea, registra `completedAt`.

**Backend — Módulo Goals:**
- Modelo `Goal` con índice único `(year, month)`.
- `GET /goals?year=&month=`, `POST /goals`, `PATCH /goals/:id`.
- RBAC en CREATE/UPDATE: `DIRECCION_GENERAL`, `LIDER_COMERCIAL`, `ADMINISTRADOR`.
- Auditoría en CREATE y UPDATE.

**Backend — Módulo Rooms:**
- Modelo `Room` con capacidades por tipo de montaje.
- `GET /rooms` (solo lectura, autenticado).

**Backend — Módulo Dashboard:**
- `GET /dashboard/snapshot?year=&month=`.
- Calcula: ventas confirmadas, pipeline total/ponderado, brecha, cobertura, ticket promedio, conteo de tareas, oportunidades vencidas, actividades recientes.
- Alerta de preventa: `pipelineWeighted < presaleThreshold% * revenueTarget`.
- Brecha nunca negativa: `max(revenueTarget - confirmedSales, 0)`.

**Backend — Errores:**
- `ConflictError` (409) añadido a la jerarquía de errores.

**Backend — app.js:**
- Registradas las 12 rutas de la Fase 1.

**Frontend — Clientes API:**
- `users.api.js`, `companies.api.js`, `contacts.api.js`, `activities.api.js`, `opportunities.api.js`, `tasks.api.js`, `goals.api.js`, `rooms.api.js`, `dashboard.api.js`, `catalogs.api.js`.

**Frontend — Componentes UI:**
- `Select.jsx`, `Modal.jsx` (con bloqueo de scroll), `Table.jsx` con sus CSS.

**Frontend — Módulo Usuarios:**
- `UserList.jsx` (tabla con edición en modal), `UserForm.jsx`.
- Página `/usuarios`.

**Frontend — Módulo CRM (Empresas):**
- `CompanyList.jsx` con búsqueda de texto y filtro por estado.
- `CompanyForm.jsx` cargando segmentos desde catálogos.
- `CompanyDetail.jsx` con tabs (info, contactos, actividades, oportunidades) y registro de actividad/contacto desde la misma ficha.
- `ContactForm.jsx`, `ActivityForm.jsx`.
- Páginas `/empresas` y `/empresas/[id]`.

**Frontend — Módulo Pipeline:**
- `OpportunityList.jsx` con filtro por etapa y columna de vencimiento.
- `OpportunityForm.jsx` con carga dinámica de empresas, tipos de evento y salones.
- `StageSelector.jsx` con visualización de probabilidad por etapa.
- Página `/pipeline`.

**Frontend — Módulo Tareas:**
- `TaskList.jsx` con filtro por estado y acción rápida de completar.
- `TaskForm.jsx`.
- Página `/tareas`.

**Frontend — Módulo Actividades:**
- `ActivityList.jsx` (solo lectura global).
- Página `/actividades`.

**Frontend — Módulo Metas:**
- `GoalView.jsx` con selector de mes/año.
- `GoalForm.jsx`.
- Página `/metas`.

**Frontend — Módulo Salones:**
- `RoomList.jsx` con tarjetas de capacidades.
- Página `/salones`.

**Frontend — Módulo Auditoría:**
- `AuditList.jsx` con filtro por módulo.
- Página `/auditoria`.

**Frontend — Dashboard:**
- `DashboardPanel.jsx` con KPIs en tiempo real, barra de progreso vs. meta, alertas de preventa y tareas vencidas, sección de oportunidades vencidas y actividades recientes.
- `KPICard.jsx` + `KPICard.css`, `DashboardPanel.css`.
- Página `/dashboard` actualizada para consumir datos reales.

**Frontend — Estilos:**
- `global.css` extendido con: `page-container`, `page-header`, `page-title`, `page-filters`, `badges` (success/danger/warning/neutral), `tabs`, `form-actions`, `form-grid-2`, `detail-grid`, `info-row`, `link-btn`, listas de contactos/actividades/oportunidades, `stage-list`, `room-grid`, `room-card`.
- `tokens.css` extendido con `--shadow-xl`.

### Hitos alcanzados
- **H1** — CRM operativo: alta/listado/detalle/edición de empresa con auditoría.
- **H2** — Pipeline operativo: crear oportunidad, cambiar etapa, ver historial, ponderado automático.
- **H3** — Dashboard funcional: KPIs reflejan datos reales, alertas activas.
- **H4** — MVP completo: todos los módulos de Fase 1 operativos; auditoría y RBAC verificados.
