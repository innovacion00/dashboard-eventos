import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { requestLogger } from './core/middlewares/request-logger.middleware.js';
import { errorMiddleware } from './core/middlewares/error.middleware.js';
import { NotFoundError } from './core/errors/NotFoundError.js';

// Rutas de módulos
import { authRouter } from './modules/auth/auth.routes.js';
import { auditRouter } from './modules/audit/audit.routes.js';
import { catalogRouter } from './modules/catalogs/catalog.routes.js';

const app = express();

// Middlewares globales
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Rutas
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/audit-logs', auditRouter);
app.use('/api/v1/catalogs', catalogRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', env: env.NODE_ENV } });
});

// 404 para rutas no encontradas
app.use((_req, _res, next) => {
  next(new NotFoundError('Ruta no encontrada'));
});

// Manejador centralizado de errores
app.use(errorMiddleware);

export { app };
