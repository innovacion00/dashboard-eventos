# Changelog — GEH Events Command Center

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
