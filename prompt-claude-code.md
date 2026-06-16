# Prompt inicial para Claude Code (extensión de VS Code)

> Copia y pega el bloque de abajo en Claude Code para arrancar el proyecto. Asume que ya tienes los archivos `planning.md`, `arquitectura.md` y `CLAUDE.md` en el repositorio (idealmente en `docs/` y `CLAUDE.md` en la raíz).

---

## Prompt

```
Hola Claude. Vamos a iniciar un nuevo proyecto desde cero. Antes de escribir una sola línea de código, quiero que leas con atención los siguientes archivos del repositorio y los uses como tu fuente de verdad en cada decisión:

1. CLAUDE.md (raíz) — contexto persistente: stack, reglas críticas, convenciones, qué hacer y qué no.
2. docs/planning.md — visión del proyecto, fases, hitos, MVP y estrategia de desarrollo.
3. docs/arquitectura.md — estructura de carpetas, capas, modelo de datos MongoDB, contratos de API, RBAC, auditoría.
4. docs/Informe_Técnico-Funcional.txt — especificación funcional original del Hotel Windsor House (GEH Events Command Center).

Léelos completos antes de proponer nada.

==============================
CONTEXTO RESUMIDO DEL PROYECTO
==============================
Construyo el sistema "GEH Events Command Center" para el Hotel Windsor House: una plataforma integral de gestión comercial y operativa de eventos. La fase actual es la Fase 0 (cimientos) y luego Fase 1 (MVP comercial: auth, usuarios, CRM, actividades, pipeline, tareas, metas, salones, dashboard, auditoría).

==============================
STACK (NO NEGOCIABLE)
==============================
- Lenguaje: JavaScript (ESM, sin TypeScript en backend; el .ts solo en middleware.ts de Astro).
- Backend: Node.js + Express.js.
- Frontend: Astro + React (.jsx) en islas. CSS plano + variables CSS. SIN Tailwind, SIN styled-components, SIN UI libraries.
- Base de datos: MongoDB con Mongoose.
- Auth: JWT + bcrypt.
- Validación: Zod.
- Logger: Pino.
- Test: Vitest + Supertest.
- Arquitectura: monolito modular con dos paquetes (backend/ y frontend/).

==============================
LO QUE QUIERO QUE HAGAS AHORA
==============================
TAREA 0 — Crear el esqueleto del proyecto (Fase 0 "Cimientos" del planning.md).

Concretamente:

1. Crear la estructura de carpetas exactamente como aparece en docs/arquitectura.md (sección 2), tanto en backend/ como en frontend/.

2. Inicializar package.json en cada paquete, con los scripts esperados en CLAUDE.md (sección "Comandos del proyecto") e instalar las dependencias mínimas necesarias.

3. Backend:
   - Configurar Express con: CORS, body parser, request logger, manejador de errores centralizado.
   - Conexión a MongoDB con Mongoose, leyendo MONGO_URI de .env.
   - Cargar y validar variables de entorno en config/env.js.
   - Configurar Pino como logger.
   - Implementar el sistema base de errores (AppError, ValidationError, AuthError, NotFoundError, ForbiddenError).
   - Middleware de validación con Zod (validate(schema)).
   - Implementar el módulo de auth completo:
       · Modelo User (con bcrypt y todos los campos de arquitectura.md sección 4).
       · POST /api/v1/auth/login → devuelve JWT (8h) y datos del usuario.
       · POST /api/v1/auth/logout → básico (limpieza del lado del cliente, log en auditoría).
       · GET /api/v1/auth/me → datos del usuario autenticado.
       · Middleware authMiddleware (verifica JWT y carga req.user).
       · Middleware requireRole([...]) (RBAC reutilizable).
   - Implementar el módulo audit base (modelo + servicio reutilizable auditService.log({...})).
   - Crear seed scripts:
       · catalogs.seed.js — siembra los catálogos cerrados (segmentos, tipos de evento, tipos de actividad, fuentes, etapas con su probabilidad, estados de empresa).
       · admin.seed.js — crea un usuario administrador inicial con credenciales tomadas de variables de entorno.
   - .env.example con todas las variables documentadas.

4. Frontend:
   - Astro configurado con la integración de React.
   - Layout base con Sidebar.astro y Header.astro (estructura HTML semántica, estilos básicos con CSS plano).
   - Página de login (login.astro) con un formulario React (.jsx) que consume POST /auth/login.
   - Cliente HTTP en src/lib/api/client.js (fetch wrapper con manejo de JWT y de errores).
   - Sistema de sesión en src/lib/auth/session.js (guardar token, leerlo, borrarlo).
   - Middleware Astro (src/middleware.ts) que protege todas las rutas salvo /login.
   - Página /dashboard como placeholder (solo muestra "Bienvenido, {nombre}" leyendo /auth/me).
   - Tokens de estilo en src/styles/tokens.css (paleta de color, tipografía, espaciado).
   - global.css con reset moderno.
   - .env.example con PUBLIC_API_URL.

5. Documentación viva:
   - Crear docs/api.md vacío con un encabezado base donde iremos documentando endpoints.
   - Crear docs/changelog.md con la entrada inicial de esta fase.
   - README.md raíz con instrucciones de arranque (instalación, levantar Mongo, seeds, npm run dev en ambos paquetes).

==============================
RESTRICCIONES Y GUARDARRAÍLES
==============================
- Respeta al pie de la letra las reglas de CLAUDE.md, especialmente:
  · RBAC en cada endpoint sensible.
  · Auditoría en cada CREATE / UPDATE / DELETE relevante.
  · Soft delete por defecto.
  · Validación con Zod en frontera del backend.
  · Estructura de respuesta { success, data, meta } / { success, error }.
  · Naming kebab-case para archivos, camelCase para variables, plural en rutas API.
  · Idioma del producto: español. Idioma del código: inglés.
- No introduzcas Tailwind ni ninguna librería de UI.
- No uses TypeScript en backend.
- No hardcodees catálogos en el código de aplicación: van en la colección "catalogs".
- Sí mantén las probabilidades por etapa en core/constants/stages.js (regla de negocio fija).
- No crees módulos que no toquen en esta fase (cotizaciones, eventos, facturación, comisiones, encuestas: NO ahora).

==============================
CÓMO QUIERO QUE TRABAJES
==============================
1. Empieza confirmándome que leíste los 4 documentos y resúmeme en 5 líneas el alcance de esta tarea, antes de tocar archivos.
2. Propón un plan de creación de archivos en el orden que vas a ir creándolos, agrupado por bloques (estructura → backend core → auth → audit → seeds → frontend base → docs). No empieces a escribir hasta que confirme el plan.
3. Una vez confirmado, ejecuta. Avanza por bloques: termina un bloque, hazme un resumen breve de lo creado, y sigue con el siguiente.
4. Si en algún momento encuentras una ambigüedad o un punto donde el informe técnico-funcional y el planning.md no son claros, PARA y pregúntame antes de inventar una decisión.
5. Al final del Bloque "Cimientos completos", entrégame:
   · Un resumen de qué quedó listo y qué falta para cerrar la Fase 0.
   · Instrucciones exactas para que pueda correr en local: instalar deps, levantar Mongo, correr seeds, iniciar backend y frontend, y probar login con el admin sembrado.
   · La entrada actualizada de docs/changelog.md.

Cuando termines la Fase 0, no avances solo a la Fase 1. Pregúntame por dónde quiero empezar la Fase 1 (mi orden preferido es el de docs/planning.md sección 6: Auth ya estará listo, así que seguiríamos por Usuarios completos → CRM Empresas → Contactos → Actividades → Pipeline → Tareas → Metas → Salones → Dashboard).

Empieza ahora con el paso 1: confírmame que leíste los documentos y dame el resumen de 5 líneas.
```

---

## Cómo usar este prompt

1. **Coloca los archivos en el repositorio** antes de pegar el prompt:
   - `CLAUDE.md` en la raíz del repo.
   - `docs/planning.md`
   - `docs/arquitectura.md`
   - `docs/Informe_Técnico-Funcional.txt`

2. **Abre Claude Code en VS Code** dentro de la carpeta raíz del proyecto.

3. **Pega el bloque del prompt** (lo de adentro de las tres comillas).

4. **Confirma el plan** que Claude te proponga antes de dejarlo escribir código. Es la forma de mantener el control.

5. **Avanza por bloques**: al final de cada bloque, revisa lo creado, prueba que arranque, y solo entonces das luz verde para el siguiente.

---

## Prompts cortos para fases siguientes

Cuando termines la Fase 0 y quieras seguir con módulos de Fase 1, ya no necesitas el prompt largo. Estos cortos bastan:

**Para arrancar un módulo nuevo:**
```
Vamos con el módulo de [Empresas / Oportunidades / Tareas / etc].
Sigue las capas definidas en docs/arquitectura.md (model → repository → service → controller → routes → validation), respeta las reglas de CLAUDE.md (RBAC, auditoría, validación con Zod, soft delete) y los endpoints listados en arquitectura.md sección 6.
Antes de codificar, dame un plan corto con los archivos a crear y el contrato de cada endpoint. Espera mi confirmación.
```

**Para una funcionalidad transversal (ej. dashboard):**
```
Implementa el módulo Dashboard según docs/arquitectura.md sección 5.5 (getMonthlySnapshot). Lee y respeta todas las reglas de negocio de cálculo definidas allí. Solo agrega el endpoint GET /api/v1/dashboard/snapshot, su service, y el consumo desde el frontend en src/pages/dashboard.astro con sus componentes React.
Plan primero, código después.
```

**Para corregir o refactorizar:**
```
Encontré que [descripción del problema]. Antes de tocar nada, propón el diagnóstico y el plan de corrección. Respeta las reglas de CLAUDE.md.
```
