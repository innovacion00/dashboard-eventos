# GEH Events Command Center

Sistema de gestión comercial y operativa de eventos para el **Hotel Windsor House**.

---

## Requisitos previos

- Node.js >= 20
- MongoDB local o Docker

---

## Arranque local paso a paso

### 1. Clonar e instalar dependencias

```bash
# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install
```

### 2. Configurar variables de entorno

```bash
# Backend
cp backend/.env.example backend/.env
# Editar backend/.env: cambiar JWT_SECRET, ADMIN_PASSWORD y MONGO_URI si es necesario

# Frontend
cp frontend/.env.example frontend/.env
# Si el backend corre en un puerto distinto al 4000, editar PUBLIC_API_URL
```

### 3. Levantar MongoDB

**Con MongoDB instalado localmente:** simplemente asegúrate de que el servicio esté corriendo.

**Con Docker:**
```bash
docker run -d -p 27017:27017 --name geh-mongo mongo:latest
```

Verificar que `MONGO_URI=mongodb://localhost:27017/geh_events` en `backend/.env`.

### 4. Sembrar base de datos

```bash
cd backend

# Sembrar catálogos (segmentos, tipos de evento, tipos de actividad, fuentes, etapas, estados)
npm run seed:catalogs

# Crear usuario administrador inicial
npm run seed:admin

# O ambos a la vez:
npm run seed
```

El seed de admin usa las variables `ADMIN_NAME`, `ADMIN_EMAIL` y `ADMIN_PASSWORD` de `backend/.env`.
Por defecto: `admin@gehsuites.com` / `Admin123456!` (cámbialo en producción).

### 5. Iniciar backend y frontend

```bash
# Terminal 1 — Backend (puerto 4000)
cd backend
npm run dev

# Terminal 2 — Frontend (puerto 4321)
cd frontend
npm run dev
```

### 6. Verificar

- Backend health: [http://localhost:4000/health](http://localhost:4000/health)
- Frontend: [http://localhost:4321](http://localhost:4321)

### 7. Probar login

1. Abre [http://localhost:4321/login](http://localhost:4321/login)
2. Ingresa con las credenciales del admin (`ADMIN_EMAIL` / `ADMIN_PASSWORD`)
3. Deberías redirigir al dashboard con "Bienvenido, {nombre}"

---

## Scripts disponibles

### Backend (`cd backend`)

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor con hot reload (nodemon) |
| `npm start` | Servidor en modo producción |
| `npm test` | Ejecutar tests con Vitest |
| `npm run seed` | Siembra catálogos + admin |
| `npm run seed:catalogs` | Solo catálogos |
| `npm run seed:admin` | Solo usuario admin |

### Frontend (`cd frontend`)

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor Astro en desarrollo (puerto 4321) |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |

---

## Estructura del proyecto

```
DASHBOARD-EVENTOS/
├── backend/         # API Node.js + Express
├── frontend/        # Aplicación Astro + React
├── docs/            # Documentación viva
│   ├── planning.md
│   ├── arquitectura.md
│   ├── api.md
│   └── changelog.md
├── CLAUDE.md        # Contexto para Claude Code
├── .gitignore
└── README.md
```

---

## Documentación adicional

- [Planning y fases](docs/planning.md)
- [Arquitectura técnica](docs/arquitectura.md)
- [API Reference](docs/api.md)
- [Changelog](docs/changelog.md)
