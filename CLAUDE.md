# CLAUDE.md — Contexto del proyecto

Este archivo es el contexto persistente que Claude Code lee automáticamente al inicio de cada sesión. Contiene las reglas, convenciones y comandos necesarios para trabajar en este proyecto.

---

## Proyecto

**Nombre**: GEH Events Command Center
**Cliente**: Hotel Windsor House
**Tipo**: Sistema de Gestión Comercial y Operativa de Eventos
**Documentos de referencia**:
- `docs/planning.md` — Fases, objetivos, hitos
- `docs/arquitectura.md` — Arquitectura técnica detallada
- `docs/Informe_Técnico-Funcional.txt` — Especificación funcional original

---

## Stack tecnológico (no negociable)

| Capa | Tecnología |
|---|---|
| Lenguaje | JavaScript (ESM, no CommonJS) |
| Backend | Node.js + Express.js |
| Frontend | Astro + React (.jsx) en islas |
| Estilos | CSS plano + variables CSS (sin Tailwind, sin styled-components) |
| Base de datos | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Validación | Zod |
| Logger | Pino |
| Test | Vitest + Supertest |

> **Importante**: no introducir nuevas dependencias mayores sin avisar primero. Sí se aceptan utilidades pequeñas (date-fns, etc.) cuando sean necesarias.

---

## Arquitectura

**Monolito modular**. Dos paquetes en el repo: `backend/` y `frontend/`.

El backend se organiza en módulos por dominio (`auth`, `users`, `companies`, `contacts`, `activities`, `opportunities`, `tasks`, `goals`, `rooms`, `dashboard`, `audit`, `catalogs`). Cada módulo tiene cinco capas:

```
routes.js → controller.js → service.js → repository.js → model.js
                                                          + validation.js
```

**Reglas de capas:**
- El **controller** nunca contiene lógica de negocio: solo orquesta, devuelve respuestas estandarizadas.
- El **service** contiene la lógica de negocio. Un service puede llamar a otro service (de otro módulo). **Nunca** importar un repository de otro módulo.
- El **repository** es la única capa que llama a Mongoose.
- La **validación** se aplica con un middleware `validate(schema)` antes del controller.

Detalles completos en `docs/arquitectura.md`.

---

## Estructura de carpetas

```
backend/src/
  config/         # env, database, logger
  core/           # middlewares, errors, utils, constants
  modules/        # un subdirectorio por dominio
  seeds/          # scripts para sembrar catálogos y admin inicial
  app.js
  server.js

frontend/src/
  pages/          # rutas Astro
  components/
    layout/       # Sidebar, Header, Layout (.astro)
    ui/           # Button, Input, Modal, Table (.jsx)
    <feature>/    # componentes específicos por feature
  lib/
    api/          # cliente HTTP por recurso
    auth/         # sesión y guards
    utils/        # format (es-CO), validators
  styles/         # global.css, tokens.css, components/
  middleware.ts
```

---

## Reglas críticas (siempre)

1. **Idioma del producto**: español. Mensajes de error, etiquetas, validaciones, formato de fecha y moneda en `es-CO`.
2. **Idioma del código**: inglés. Nombres de archivos, variables, funciones y comentarios en inglés.
3. **RBAC en cada endpoint sensible**, no solo en metas y usuarios. Usar el middleware `requireRole([...])`.
4. **Auditoría obligatoria** en todo CREATE, UPDATE, DELETE de empresas, contactos, oportunidades, actividades, tareas, metas, usuarios. Llamar `auditService.log({...})` después de la operación.
5. **Soft delete por defecto** (`active: false`). El hard delete solo si la entidad no tiene relaciones.
6. **Validar con Zod** en frontera del backend. Nada de validación ad-hoc en el controller.
7. **Respuestas estandarizadas**:
   - Éxito: `{ success: true, data, meta? }`
   - Error: `{ success: false, error: { code, message, details? } }`
8. **No exponer modelos Mongoose directamente**. Mapear a DTOs/respuestas limpias en el controller.
9. **Listados con paginación obligatoria**: `?page=1&limit=20`. Default `limit=20`, máximo `100`.
10. **JWT con expiración 8h**. No persistir contraseñas en claro. bcrypt con `BCRYPT_ROUNDS` env.
11. **Índices en Mongoose** desde el primer modelado. Especialmente: `email` único, `companyId`, `ownerId`, `stage`, fechas que se filtran.
12. **Multi-sede preparado**: aunque hoy solo opere una sede, todos los modelos relevantes deben tener `sedeId` opcional para no romper después.
13. **Nunca hardcodear catálogos** (segmentos, tipos de evento, etc.) en código de aplicación. Se leen de la colección `catalogs`.
14. **Probabilidad por etapa** sí va hardcoded en `core/constants/stages.js` porque es una regla de negocio fija.

---

## Reglas de negocio críticas a respetar

Estas reglas son del informe técnico-funcional y son **no negociables**:

- Probabilidad por etapa: `Prospecto inicial 10% | Calificado 20% | Visita 35% | Cotizado 50% | Negociación 70% | Aprobado pendiente pago 90% | Confirmado 100% | Perdido 0%`.
- `weightedValue = estimatedValue * probability / 100`, recalculado automáticamente al cambiar `stage` o `estimatedValue` (hook pre-save).
- Cada cambio de etapa crea un registro en `opportunity_history`.
- Oportunidad vencida = `nextActionAt < now` y stage no es `PERDIDO` ni `CONFIRMADO`.
- Brecha frente a meta nunca negativa: `max(target - confirmed, 0)`.
- Cobertura: `pipelineWeighted / gap`. Si `gap === 0`, cobertura es total.
- Alerta de preventa cuando `pipelineWeighted < 0.6 * revenueTarget`.
- `averageTicket = confirmedSales / confirmedEventsCount` (0 si no hay eventos).
- Eventos cancelados no cuentan en ventas confirmadas ni en próximos eventos.
- Empresa creada manualmente: status default `PROSPECTO`.
- El creador de empresa/oportunidad queda como su `ownerId` (responsable comercial).
- Al registrar una actividad con próxima acción, esta **reemplaza** (no acumula) la próxima acción de la empresa.
- Contraseña mínimo 8 caracteres.
- Solo usuarios `ACTIVO` pueden iniciar sesión.

---

## Convenciones de código

### Naming

- Archivos: `kebab-case` → `opportunity.controller.js`, `goal-chart.jsx`.
- Variables y funciones: `camelCase`.
- Clases y modelos Mongoose: `PascalCase`.
- Constantes: `UPPER_SNAKE_CASE`.
- Rutas API: `kebab-case`, plural → `/api/v1/opportunities`, `/api/v1/audit-logs`.

### Imports

- ESM siempre: `import x from 'y'`, no `require`.
- Alias de path si se configura: `@core/...`, `@modules/...`. Si no, imports relativos limpios.
- Orden: librerías externas → módulos del core → módulos del proyecto → relativos.

### Estilo

- 2 espacios de indentación.
- Punto y coma al final.
- Comillas simples en JS, dobles en JSX para atributos.
- Funciones flecha por defecto, salvo cuando se necesite `this`.

### Async

- `async/await` siempre. Evitar `.then().catch()` salvo en código de inicialización.
- Wrappear controllers con `asyncHandler` para no repetir `try/catch`.

### Comentarios

- Solo cuando aporten contexto que el código no da. Nada de comentarios obvios.
- JSDoc en funciones públicas de services complejos.

---

## Comandos del proyecto

### Backend

```bash
cd backend
npm install
npm run dev           # nodemon con hot reload
npm start             # producción
npm test              # Vitest
npm run seed          # siembra catálogos y admin inicial
npm run lint
```

### Frontend

```bash
cd frontend
npm install
npm run dev           # astro dev (puerto 4321)
npm run build
npm run preview
```

### MongoDB local

Asumir que hay un MongoDB corriendo en `mongodb://localhost:27017`. Si no, indicar al usuario que lo levante con Docker:

```bash
docker run -d -p 27017:27017 --name geh-mongo mongo:latest
```

---

## Flujo de trabajo esperado

Cuando se me pida implementar una nueva funcionalidad, sigo este orden:

1. **Confirmo entendimiento** del requerimiento si tengo dudas.
2. **Reviso `arquitectura.md`** para alinear con el diseño definido.
3. **Defino el contrato** de la API (request/response) primero.
4. **Implemento backend** capa por capa: model → repository → service → controller → routes → validation.
5. **Pruebo** el endpoint con un caso feliz y al menos un caso de error.
6. **Implemento frontend**: cliente API → componente React → página Astro.
7. **Actualizo `docs/changelog.md`** con un resumen del cambio.

---

## Qué NO hacer

- ❌ Introducir Tailwind, styled-components, MUI, Chakra, Bootstrap.
- ❌ Usar TypeScript en backend (sí está bien el `.ts` de `middleware.ts` que Astro genera).
- ❌ Crear endpoints sin RBAC ni auditoría cuando corresponda.
- ❌ Hardcodear catálogos abiertos (sí los enum cerrados como `STAGE`, `ROLE`, `STATUS`).
- ❌ Hacer hard delete sin verificar relaciones.
- ❌ Exponer `passwordHash` ni otros campos sensibles en respuestas.
- ❌ Asumir que el usuario es admin: validar siempre el rol del `req.user`.
- ❌ Devolver `500` por errores de validación: usar el manejador centralizado.
- ❌ Mezclar lógica de Mongoose en el controller.
- ❌ Crear archivos `.tsx` en frontend (es `.jsx`).
- ❌ Modificar la estructura de carpetas sin consultar.

---

## Qué SÍ hacer

- ✅ Preguntar antes de instalar una dependencia mayor nueva.
- ✅ Sugerir mejoras cuando detecto que algo del diseño puede romperse a futuro.
- ✅ Avisar cuando el cambio que se me pide afecta a más de un módulo.
- ✅ Actualizar `docs/api.md` cuando agregue o cambie un endpoint.
- ✅ Mantener `docs/changelog.md` al día.
- ✅ Escribir mensajes de error en español y orientados al usuario final.
- ✅ Sugerir un test unitario para reglas de negocio nuevas (cálculos, validaciones).

---

## Estado actual del proyecto

> Esta sección se actualiza a medida que avanza el proyecto.

**Fase actual**: Fase 0 — Cimientos (setup inicial).

**Último hito completado**: ninguno todavía.

**Próximo hito (H0)**: estructura del repo lista, `npm run dev` arranca backend y frontend, login funcional.
