import { Router } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware.js';
import { requireRole } from '../../core/middlewares/authorize.middleware.js';
import { listAuditLogs } from './audit.controller.js';
import { ROLES } from '../../core/constants/roles.js';

export const auditRouter = Router();

auditRouter.get(
  '/',
  authMiddleware,
  requireRole([ROLES.DIRECCION_GENERAL, ROLES.ADMINISTRADOR]),
  listAuditLogs
);
