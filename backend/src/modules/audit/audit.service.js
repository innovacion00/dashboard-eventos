import { AuditLog } from './audit-log.model.js';
import { logger } from '../../config/logger.js';

/**
 * Registra una acción en el log de auditoría.
 * No lanza excepciones para no interrumpir el flujo principal.
 */
export async function audit({ userId, userEmail, module, action, entityId, before, after, req }) {
  try {
    await AuditLog.create({
      userId,
      userEmail,
      module,
      action,
      entityId,
      before,
      after,
      ip: req?.ip,
      userAgent: req?.headers?.['user-agent'],
    });
  } catch (err) {
    logger.error({ err }, 'Error al registrar auditoría');
  }
}
