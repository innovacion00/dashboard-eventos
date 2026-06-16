# API Reference — GEH Events Command Center

> Base URL: `http://localhost:4000/api/v1`
> Autenticación: `Authorization: Bearer <token>`
> Todas las respuestas siguen el formato `{ success, data, meta? }` / `{ success, error }`.

---

## Auth

### POST /auth/login
Inicia sesión y devuelve un JWT.

**Request body:**
```json
{ "email": "admin@gehsuites.com", "password": "Admin123456!" }
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": { "id": "...", "name": "...", "email": "...", "role": "ADMINISTRADOR" }
  }
}
```

**Errores:** 401 credenciales incorrectas, 401 cuenta inactiva, 422 validación.

---

### POST /auth/logout
Cierra sesión (requiere token). Registra en auditoría.

**Headers:** `Authorization: Bearer <token>`
**Response 200:** `{ "success": true, "data": { "message": "Sesión cerrada correctamente" } }`

---

### GET /auth/me
Devuelve los datos del usuario autenticado.

**Headers:** `Authorization: Bearer <token>`
**Response 200:** `{ "success": true, "data": { "id", "name", "email", "role" } }`

---

## Catalogs

### GET /catalogs?type=SEGMENT
Lista catálogos activos. El parámetro `type` es opcional; sin él devuelve todos.

**Tipos disponibles:** `SEGMENT`, `EVENT_TYPE`, `ACTIVITY_TYPE`, `ORIGIN`, `COMPANY_STATUS`, `STAGE`

**Headers:** `Authorization: Bearer <token>`

---

## Audit Logs

### GET /audit-logs
Lista logs de auditoría paginados.

**RBAC:** `DIRECCION_GENERAL`, `ADMINISTRADOR`
**Query params:** `module`, `action`, `userId`, `from` (ISO date), `to` (ISO date), `page`, `limit`

---

## Health

### GET /health
Verifica que el servidor esté activo. Sin autenticación.

---

*Los módulos de Usuarios, Empresas, Contactos, Actividades, Pipeline, Tareas, Metas y Salones se documentarán en la Fase 1.*
