# Arquitectura — GEH Events Command Center

> Documento técnico de arquitectura. Define la estructura, capas, patrones, modelo de datos, API y decisiones de diseño del sistema.

---

## 1. Visión general

El sistema es un **monolito modular** de tres componentes:

```
┌──────────────────────────────────────────────────────────────┐
│                          CLIENTE                              │
│         Frontend Astro + Islas React (.jsx) + CSS            │
└──────────────────────────────┬───────────────────────────────┘
                               │ HTTP/REST (JSON, JWT)
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                          BACKEND                              │
│            Node.js + Express.js (Monolito Modular)           │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ MÓDULOS POR DOMINIO                                    │  │
│  │ auth │ users │ companies │ contacts │ activities       │  │
│  │ opportunities │ tasks │ goals │ rooms │ dashboard      │  │
│  │ audit │ catalogs │ ...                                  │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ CORE / SHARED                                          │  │
│  │ config │ db │ middlewares │ errors │ utils │ logger    │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬───────────────────────────────┘
                               │ Mongoose
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS                              │
│                       MongoDB                                 │
└──────────────────────────────────────────────────────────────┘
```

### Principio: Monolito Modular

- **Una sola unidad desplegable** (un proceso Node, un build de Astro).
- **Módulos desacoplados** internamente, cada uno con sus capas completas (modelo → repo → service → controller → routes).
- **Comunicación entre módulos vía servicios**, nunca compartiendo modelos directamente.
- **Una sola conexión a MongoDB**, pero colecciones por dominio.

Esta organización permite que, si en el futuro se necesita escalar un módulo a un microservicio, la frontera ya está definida.

---

## 2. Estructura de carpetas

### Estructura raíz del repositorio

```
geh-events/
├── backend/                 # API Node.js + Express
├── frontend/                # Aplicación Astro + React
├── docs/                    # Documentación viva
│   ├── planning.md
│   ├── arquitectura.md
│   ├── api.md
│   └── changelog.md
├── .env.example
├── .gitignore
├── CLAUDE.md
└── README.md
```

### Estructura del backend

```
backend/
├── src/
│   ├── config/
│   │   ├── env.js              # Carga y valida variables de entorno
│   │   ├── database.js         # Conexión Mongoose
│   │   └── logger.js           # Configuración de Pino/Winston
│   ├── core/
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js          # Verifica JWT
│   │   │   ├── authorize.middleware.js     # RBAC: requireRole([...])
│   │   │   ├── error.middleware.js         # Manejo centralizado de errores
│   │   │   ├── validate.middleware.js      # Validación con Zod/Joi
│   │   │   └── request-logger.middleware.js
│   │   ├── errors/
│   │   │   ├── AppError.js
│   │   │   ├── ValidationError.js
│   │   │   ├── AuthError.js
│   │   │   └── NotFoundError.js
│   │   ├── utils/
│   │   │   ├── async-handler.js            # wrapper try/catch
│   │   │   ├── paginate.js
│   │   │   └── response.js                 # estructura estándar de respuesta
│   │   └── constants/
│   │       ├── roles.js                    # Enum de roles
│   │       └── stages.js                   # Etapas y probabilidades pipeline
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.routes.js
│   │   │   └── auth.validation.js
│   │   ├── users/
│   │   │   ├── user.model.js
│   │   │   ├── user.repository.js
│   │   │   ├── user.service.js
│   │   │   ├── user.controller.js
│   │   │   ├── user.routes.js
│   │   │   └── user.validation.js
│   │   ├── companies/
│   │   │   ├── company.model.js
│   │   │   ├── company.repository.js
│   │   │   ├── company.service.js
│   │   │   ├── company.controller.js
│   │   │   ├── company.routes.js
│   │   │   └── company.validation.js
│   │   ├── contacts/
│   │   ├── activities/
│   │   ├── opportunities/
│   │   ├── tasks/
│   │   ├── goals/
│   │   ├── rooms/
│   │   ├── dashboard/
│   │   ├── audit/
│   │   └── catalogs/
│   ├── seeds/
│   │   ├── catalogs.seed.js
│   │   └── admin.seed.js
│   ├── app.js                  # Configura Express, carga rutas
│   └── server.js               # Arranca el servidor
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── package.json
└── README.md
```

### Estructura del frontend (Astro)

```
frontend/
├── src/
│   ├── pages/
│   │   ├── index.astro                 # Redirige a /login o /dashboard
│   │   ├── login.astro
│   │   ├── dashboard.astro
│   │   ├── empresas/
│   │   │   ├── index.astro             # Listado
│   │   │   └── [id].astro              # Detalle (ficha consolidada)
│   │   ├── pipeline/
│   │   │   └── index.astro
│   │   ├── actividades/
│   │   ├── tareas/
│   │   ├── metas/
│   │   ├── salones/
│   │   ├── usuarios/
│   │   └── auditoria/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.astro
│   │   │   ├── Header.astro
│   │   │   └── Layout.astro
│   │   ├── ui/                         # Componentes React (.jsx)
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Table.jsx
│   │   │   └── Alert.jsx
│   │   ├── dashboard/
│   │   │   ├── KPICard.jsx
│   │   │   ├── GoalChart.jsx
│   │   │   └── PipelineChart.jsx
│   │   ├── crm/
│   │   │   ├── CompanyList.jsx
│   │   │   ├── CompanyForm.jsx
│   │   │   └── CompanyDetail.jsx
│   │   └── pipeline/
│   │       ├── OpportunityList.jsx
│   │       └── StageSelector.jsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.js               # fetch wrapper con JWT
│   │   │   ├── auth.api.js
│   │   │   ├── companies.api.js
│   │   │   └── ...
│   │   ├── auth/
│   │   │   ├── session.js              # manejo de token en cliente
│   │   │   └── guard.js
│   │   └── utils/
│   │       ├── format.js               # formato de moneda, fecha (es-CO)
│   │       └── validators.js
│   ├── styles/
│   │   ├── global.css                  # variables CSS, reset
│   │   ├── tokens.css                  # paleta, tipografía, espaciado
│   │   └── components/                 # un .css por componente complejo
│   ├── middleware.ts                   # protección de rutas Astro
│   └── env.d.ts
├── public/
├── astro.config.mjs
├── package.json
└── README.md
```

---

## 3. Capas del backend (por módulo)

Cada módulo sigue las mismas cinco capas, de adentro hacia afuera:

```
┌─────────────────────────────────────────────────┐
│  routes.js     → define rutas y middlewares     │
├─────────────────────────────────────────────────┤
│  controller.js → recibe req, valida, llama     │
│                  al service, formatea respuesta │
├─────────────────────────────────────────────────┤
│  service.js    → lógica de negocio              │
│                  (reglas, cálculos, orquesta)   │
├─────────────────────────────────────────────────┤
│  repository.js → acceso a datos                 │
│                  (operaciones Mongoose)         │
├─────────────────────────────────────────────────┤
│  model.js      → esquema Mongoose               │
└─────────────────────────────────────────────────┘
```

### Reglas por capa

- **Controller**: nada de lógica de negocio. Solo orquesta, transforma errores, devuelve respuestas estandarizadas.
- **Service**: la lógica de negocio vive aquí. Pueden llamarse entre módulos (un service puede importar otro service, **nunca un repository de otro módulo**).
- **Repository**: única capa que habla con Mongoose. Permite cambiar el ODM en el futuro sin tocar la lógica.
- **Model**: define el esquema, validaciones de Mongoose, índices, hooks.
- **Validation**: esquema Zod/Joi exportado para que el middleware `validate` lo aplique.

---

## 4. Modelo de datos (MongoDB)

### Colecciones principales

| Colección | Descripción |
|---|---|
| `users` | Usuarios del sistema con rol y estado |
| `companies` | Empresas/clientes/prospectos |
| `contacts` | Contactos vinculados a una empresa |
| `activities` | Bitácora de actividades comerciales |
| `opportunities` | Oportunidades del pipeline |
| `opportunity_history` | Historial de cambios de etapa |
| `tasks` | Tareas/pendientes |
| `goals` | Metas comerciales por mes |
| `rooms` | Catálogo de salones |
| `audit_logs` | Bitácora de auditoría centralizada |
| `catalogs` | Catálogos (segmentos, tipos, fuentes, estados) |

### Esquemas detallados

#### `users`
```js
{
  _id: ObjectId,
  name: String,             // requerido
  email: String,            // único, requerido
  passwordHash: String,     // bcrypt
  role: String,             // enum: DIRECCION_GENERAL, GERENCIA_HOTEL,
                            //       LIDER_COMERCIAL, EJECUTIVO_COMERCIAL,
                            //       COORDINACION_OPERATIVA, FINANCIERO,
                            //       CALIDAD, ADMINISTRADOR
  status: String,           // ACTIVO | INACTIVO | SUSPENDIDO
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```
Índices: `email` (único), `role`.

#### `companies`
```js
{
  _id: ObjectId,
  name: String,             // requerido
  taxId: String,            // identificador fiscal (NIT/RUT)
  segment: String,          // ref a catálogo de segmentos
  status: String,           // PROSPECTO | CLIENTE_ACTIVO | INACTIVO | ALIADO | AGENCIA | GUBERNAMENTAL
  origin: String,           // ref a catálogo de fuentes
  estimatedPotential: Number,
  location: {
    country: String,
    city: String,
    address: String
  },
  ownerId: ObjectId,        // responsable comercial (ref users)
  lastContactAt: Date,
  nextActionAt: Date,
  nextActionDescription: String,
  active: Boolean,          // soft delete
  createdAt: Date,
  updatedAt: Date
}
```
Índices: `name` (text), `taxId` (sparse único), `segment`, `status`, `ownerId`.

#### `contacts`
```js
{
  _id: ObjectId,
  companyId: ObjectId,      // ref companies
  fullName: String,
  position: String,
  email: String,
  phone: String,
  notes: String,
  active: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```
Índices: `companyId`, `email`.

#### `activities`
```js
{
  _id: ObjectId,
  companyId: ObjectId,
  contactId: ObjectId,       // opcional
  opportunityId: ObjectId,   // opcional
  type: String,              // catálogo de 14 tipos
  date: Date,
  result: String,
  nextActionDescription: String,
  nextActionAt: Date,
  completed: Boolean,        // true al crear
  ownerId: ObjectId,         // quien la registra
  createdAt: Date
}
```
Índices: `companyId`, `date` desc, `ownerId`.

#### `opportunities`
```js
{
  _id: ObjectId,
  companyId: ObjectId,
  ownerId: ObjectId,
  eventType: String,         // ref a catálogo de tipos de evento
  segment: String,
  probableRoomId: ObjectId,  // ref rooms (opcional)
  estimatedEventDate: Date,
  projectionMonth: String,   // YYYY-MM
  attendees: Number,
  estimatedValue: Number,
  stage: String,             // enum 8 etapas
  probability: Number,       // 0-100, derivado de stage
  weightedValue: Number,     // estimatedValue * probability / 100
  nextActionAt: Date,
  nextActionDescription: String,
  notes: String,
  active: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```
Índices: `companyId`, `ownerId`, `stage`, `projectionMonth`, `nextActionAt`.

> El recálculo de `probability` y `weightedValue` ocurre en un **hook pre-save** del modelo o en el **service** al cambiar `stage` o `estimatedValue`.

#### `opportunity_history`
```js
{
  _id: ObjectId,
  opportunityId: ObjectId,
  fromStage: String,         // null si es creación
  toStage: String,
  changedBy: ObjectId,
  changedAt: Date
}
```
Índices: `opportunityId`, `changedAt`.

#### `tasks`
```js
{
  _id: ObjectId,
  title: String,
  description: String,
  type: String,
  priority: String,          // ALTA | MEDIA | BAJA
  dueDate: Date,
  assigneeId: ObjectId,
  status: String,            // PENDIENTE | EN_PROGRESO | COMPLETADA | CANCELADA | VENCIDA
  relatedEntity: {           // opcional
    kind: String,            // 'company' | 'opportunity' | 'event'
    id: ObjectId
  },
  createdBy: ObjectId,
  createdAt: Date,
  completedAt: Date
}
```
Índices: `assigneeId`, `status`, `dueDate`, `priority`.

#### `goals`
```js
{
  _id: ObjectId,
  year: Number,
  month: Number,             // 1-12
  revenueTarget: Number,
  eventCountTarget: Number,
  averageTicketTarget: Number,
  marginTarget: Number,      // porcentaje
  presaleThreshold: Number,  // 60% calculado o configurable
  createdBy: ObjectId,
  updatedAt: Date
}
```
Índices: `(year, month)` único.

#### `rooms`
```js
{
  _id: ObjectId,
  name: String,
  description: String,
  capacities: {
    auditorium: Number,
    school: Number,
    uShape: Number,
    cocktail: Number,
    banquet: Number
  },
  baseRate: Number,
  active: Boolean
}
```

#### `audit_logs`
```js
{
  _id: ObjectId,
  userId: ObjectId,
  userEmail: String,         // snapshot por si el user se borra
  module: String,            // 'companies', 'opportunities', etc.
  action: String,            // LOGIN | CREATE | UPDATE | DELETE
  entityId: ObjectId,        // id del documento afectado
  before: Object,            // estado anterior (en updates/deletes)
  after: Object,             // estado nuevo (en creates/updates)
  ip: String,
  userAgent: String,
  createdAt: Date
}
```
Índices: `userId`, `module`, `action`, `createdAt` desc, `entityId`.

#### `catalogs`
```js
{
  _id: ObjectId,
  type: String,              // 'SEGMENT' | 'EVENT_TYPE' | 'ACTIVITY_TYPE' |
                             // 'ORIGIN' | 'COMPANY_STATUS' | 'STAGE' | ...
  code: String,              // identificador estable (no cambia)
  label: String,             // texto en español que ve el usuario
  metadata: Object,          // ej. en STAGE: { probability: 50 }
  order: Number,
  active: Boolean
}
```
Índices: `(type, code)` único, `type`.

---

## 5. Reglas de negocio críticas (implementación)

### 5.1 Probabilidad por etapa del pipeline

Constante en `core/constants/stages.js`:

```js
export const STAGES = {
  PROSPECTO_INICIAL: { code: 'PROSPECTO_INICIAL', label: 'Prospecto inicial', probability: 10 },
  CALIFICADO:        { code: 'CALIFICADO',        label: 'Calificado',        probability: 20 },
  VISITA_INSPECCION: { code: 'VISITA_INSPECCION', label: 'Visita / Inspección', probability: 35 },
  COTIZADO:          { code: 'COTIZADO',          label: 'Cotizado',          probability: 50 },
  NEGOCIACION:       { code: 'NEGOCIACION',       label: 'Negociación',       probability: 70 },
  APROBADO_PENDIENTE_PAGO: { code: 'APROBADO_PENDIENTE_PAGO', label: 'Aprobado, pendiente de pago', probability: 90 },
  CONFIRMADO:        { code: 'CONFIRMADO',        label: 'Confirmado',        probability: 100 },
  PERDIDO:           { code: 'PERDIDO',           label: 'Perdido',           probability: 0 }
};
```

### 5.2 Cálculo automático en oportunidades

En el `pre('save')` del modelo de oportunidad:

```js
if (this.isModified('stage') || this.isModified('estimatedValue')) {
  this.probability = STAGES[this.stage].probability;
  this.weightedValue = (this.estimatedValue * this.probability) / 100;
}
```

### 5.3 Historial de cambio de etapa

En el service `changeStage(opportunityId, newStage, userId)`:

```js
const opportunity = await repo.findById(opportunityId);
const fromStage = opportunity.stage;
opportunity.stage = newStage;
await opportunity.save();
await historyRepo.create({ opportunityId, fromStage, toStage: newStage, changedBy: userId });
await auditLog({ userId, module: 'opportunities', action: 'UPDATE', entityId: opportunityId, before: { stage: fromStage }, after: { stage: newStage } });
```

### 5.4 Oportunidad vencida

```js
isOverdue(opportunity) {
  return opportunity.nextActionAt < new Date()
      && opportunity.stage !== 'PERDIDO'
      && opportunity.stage !== 'CONFIRMADO';
}
```

### 5.5 Cálculo del dashboard

El service `dashboard.service.js` ofrece `getMonthlySnapshot(year, month)`:

```js
{
  goal: { revenueTarget, eventCountTarget, ... },
  confirmedSales: number,                         // suma de oportunidades CONFIRMADO del mes
  pipelineTotal: number,                          // suma estimatedValue de oportunidades activas del mes
  pipelineWeighted: number,                       // suma weightedValue
  gap: max(revenueTarget - confirmedSales, 0),
  coverage: gap === 0 ? Infinity : pipelineWeighted / gap,
  averageTicket: confirmedEvents === 0 ? 0 : confirmedSales / confirmedEvents,
  pendingTasks: number,
  overdueTasks: number,
  recentActivities: Activity[],                   // últimas 50 en últimos 30 días
  overdueOpportunities: Opportunity[],
  upcomingEvents: Event[]                         // próximos 30 días, máx 10
}
```

### 5.6 Alertas

- **Preventa insuficiente**: `pipelineWeighted < 0.6 * revenueTarget` → alerta visible.
- **Tareas vencidas**: `overdueTasks > 0` → alerta con cantidad.

---

## 6. Diseño de la API REST

### Convenciones

- **Base URL**: `/api/v1`
- **Versionado** por prefijo de URL.
- **Recursos en plural y kebab-case**: `/api/v1/opportunities`, `/api/v1/audit-logs`.
- **Métodos HTTP semánticos**: `GET` (leer), `POST` (crear), `PATCH` (actualizar parcial), `PUT` (reemplazo), `DELETE`.
- **Códigos de estado**: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable Entity, 500 Internal Server Error.

### Estructura estándar de respuesta

**Éxito:**
```json
{
  "success": true,
  "data": { /* recurso o lista */ },
  "meta": { "page": 1, "limit": 20, "total": 153 }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El nombre de la empresa es obligatorio",
    "details": [{ "field": "name", "issue": "required" }]
  }
}
```

### Endpoints principales (Fase 1)

```
# Auth
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/me

# Users (RBAC: ADMINISTRADOR, DIRECCION_GENERAL)
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/:id
PATCH  /api/v1/users/:id

# Companies
GET    /api/v1/companies                         # ?q=&segment=&status=&page=&limit=
POST   /api/v1/companies
GET    /api/v1/companies/:id                     # ficha consolidada
PATCH  /api/v1/companies/:id
DELETE /api/v1/companies/:id                     # soft delete + validar relaciones
GET    /api/v1/companies/:id/contacts
GET    /api/v1/companies/:id/activities
GET    /api/v1/companies/:id/opportunities

# Contacts
POST   /api/v1/contacts
PATCH  /api/v1/contacts/:id
DELETE /api/v1/contacts/:id

# Activities
GET    /api/v1/activities
POST   /api/v1/activities

# Opportunities
GET    /api/v1/opportunities                     # ?stage=&owner=&from=&to=
POST   /api/v1/opportunities
GET    /api/v1/opportunities/:id
PATCH  /api/v1/opportunities/:id
PATCH  /api/v1/opportunities/:id/stage           # endpoint dedicado al cambio de etapa
GET    /api/v1/opportunities/:id/history

# Tasks
GET    /api/v1/tasks                             # ?status=&assignee=me
POST   /api/v1/tasks
PATCH  /api/v1/tasks/:id
PATCH  /api/v1/tasks/:id/status

# Goals
GET    /api/v1/goals?year=&month=
POST   /api/v1/goals                             # RBAC
PATCH  /api/v1/goals/:id                         # RBAC

# Rooms
GET    /api/v1/rooms

# Dashboard
GET    /api/v1/dashboard/snapshot?year=&month=

# Catalogs
GET    /api/v1/catalogs?type=SEGMENT

# Audit logs (RBAC restringido)
GET    /api/v1/audit-logs                        # ?module=&action=&from=&to=
```

---

## 7. Autenticación y autorización

### Flujo de autenticación

1. Cliente envía `POST /auth/login` con `{ email, password }`.
2. Backend verifica usuario activo, compara hash con bcrypt.
3. Si OK, genera **JWT** firmado con `JWT_SECRET`, expiración 8h.
4. Devuelve `{ token, user: { id, name, email, role } }`.
5. Registra el login en auditoría.
6. Cliente almacena el token en `localStorage` o cookie httpOnly (preferido).
7. En cada request protegido, frontend envía `Authorization: Bearer <token>`.
8. Middleware `authMiddleware` verifica el token y carga `req.user`.

### Autorización por rol (RBAC)

Middleware reutilizable:

```js
const requireRole = (allowedRoles) => (req, res, next) => {
  if (!req.user) return next(new AuthError('No autenticado'));
  if (!allowedRoles.includes(req.user.role)) {
    return next(new AppError('No tienes permiso para esta acción', 403));
  }
  next();
};
```

Uso:

```js
router.post('/goals',
  authMiddleware,
  requireRole(['DIRECCION_GENERAL', 'LIDER_COMERCIAL', 'ADMINISTRADOR']),
  validate(createGoalSchema),
  goalController.create
);
```

### Reglas RBAC obligatorias

| Acción | Roles permitidos |
|---|---|
| Crear/editar metas | DIRECCION_GENERAL, LIDER_COMERCIAL, ADMINISTRADOR |
| Listar usuarios | DIRECCION_GENERAL, GERENCIA_HOTEL, ADMINISTRADOR |
| Crear usuarios | DIRECCION_GENERAL, ADMINISTRADOR |
| Editar/desactivar usuarios | DIRECCION_GENERAL, ADMINISTRADOR |
| Consultar auditoría | DIRECCION_GENERAL, ADMINISTRADOR |
| Eliminar empresas/oportunidades | DIRECCION_GENERAL, LIDER_COMERCIAL, ADMINISTRADOR |
| CRUD de su propia cartera | Cualquier usuario autenticado (con `ownerId === req.user.id`) |

---

## 8. Auditoría centralizada

### Servicio reutilizable

```js
// core/audit.service.js
export async function audit({ userId, userEmail, module, action, entityId, before, after, req }) {
  await AuditLog.create({
    userId, userEmail, module, action, entityId,
    before, after,
    ip: req?.ip,
    userAgent: req?.headers?.['user-agent']
  });
}
```

### Acciones obligatoriamente auditadas

- `LOGIN` exitoso
- `CREATE` en: users, companies, contacts, opportunities, activities, goals, tasks, rooms
- `UPDATE` en todos los anteriores (capturando `before` y `after` del campo modificado)
- `DELETE` (incluso soft delete)
- `IMPORT` cuando se ejecuta importación masiva
- `STAGE_CHANGE` específico para oportunidades (además del UPDATE)

---

## 9. Manejo de errores

### Jerarquía de errores

```
AppError (clase base)
  ├─ ValidationError (422)
  ├─ AuthError (401)
  ├─ ForbiddenError (403)
  ├─ NotFoundError (404)
  └─ ConflictError (409)
```

### Middleware global

Captura cualquier error que llegue por `next(err)` y devuelve la estructura estándar. Errores no controlados se loguean y devuelven 500 genérico.

---

## 10. Validación de inputs

Toda ruta que reciba body o params relevantes pasa por un middleware `validate(schema)` que usa **Zod**. Si la validación falla, devuelve 422 con `details`.

Ejemplo:

```js
// company.validation.js
import { z } from 'zod';

export const createCompanySchema = z.object({
  body: z.object({
    name: z.string().min(2),
    taxId: z.string().optional(),
    segment: z.string(),
    status: z.enum(['PROSPECTO', 'CLIENTE_ACTIVO', /* ... */]).default('PROSPECTO'),
    estimatedPotential: z.number().nonnegative().optional()
  })
});
```

---

## 11. Frontend: integración Astro + React

### Estrategia de renderizado

- **Astro renderiza el shell** de cada página (sidebar, header, contenedor).
- **Las zonas interactivas son islas React** con `client:load` o `client:visible` según prioridad.
- **Las pantallas con muchos datos en tiempo real** (Dashboard, Pipeline) son islas React grandes.
- **Los formularios** son componentes React.

### Cliente HTTP

`src/lib/api/client.js`:

```js
const BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const json = await res.json();
  if (!res.ok) throw new ApiError(json.error);
  return json;
}
```

### Protección de rutas

`src/middleware.ts` (Astro middleware):

```ts
export const onRequest = async ({ url, cookies, redirect }, next) => {
  const isPublic = ['/login'].includes(url.pathname);
  const token = cookies.get('auth_token')?.value;
  if (!isPublic && !token) return redirect('/login');
  if (isPublic && token) return redirect('/dashboard');
  return next();
};
```

### Estilos

- `src/styles/tokens.css` define variables CSS (`--color-primary`, `--space-4`, `--font-body`, etc.).
- Cada componente complejo tiene su archivo `Componente.css`.
- Componentes simples usan `style scoped` (en `.astro`) o `module.css`.

---

## 12. Variables de entorno

### Backend `.env.example`

```
NODE_ENV=development
PORT=4000

# MongoDB
MONGO_URI=mongodb://localhost:27017/geh_events

# Auth
JWT_SECRET=cambiar_en_produccion
JWT_EXPIRES_IN=8h
BCRYPT_ROUNDS=12

# CORS
CORS_ORIGIN=http://localhost:4321

# Logs
LOG_LEVEL=info
```

### Frontend `.env.example`

```
PUBLIC_API_URL=http://localhost:4000/api/v1
```

---

## 13. Pruebas

| Tipo | Herramienta | Cobertura mínima |
|---|---|---|
| Unitarias (services) | Vitest/Jest | Reglas de negocio críticas: cálculo de probabilidad, ponderado, cobertura, vencimientos |
| Integración (rutas) | Supertest | Camino feliz de cada endpoint + 401/403/422 |
| Manual | Checklist | Cada hito de planning |

---

## 14. Decisiones de diseño registradas

| # | Decisión | Razón |
|---|---|---|
| 1 | Monolito modular | Simplicidad operativa para esta escala; permite escalar a microservicios después |
| 2 | MongoDB en vez de SQL | Catálogos abiertos, ficha consolidada de empresa con documentos anidados naturales |
| 3 | Astro + islas React | Performance por defecto, sin pagar el costo de SPA completo |
| 4 | CSS plano (no Tailwind) | Preferencia del equipo |
| 5 | JWT en vez de sesión server-side | Simplicidad, escalabilidad horizontal posible |
| 6 | Auditoría como módulo desde día 1 | Brecha conocida del sistema anterior, no se puede dejar para después |
| 7 | RBAC obligatorio en cada endpoint | Brecha de seguridad principal del sistema anterior |
| 8 | Soft delete por defecto | Evitar pérdida de información relacionada |
| 9 | Catálogos en colección, no enum | Permitir cambios sin redeploy |
| 10 | Multi-sede preparado (campo `sedeId`) | Aunque hoy solo hay una sede, no romper compatibilidad después |
