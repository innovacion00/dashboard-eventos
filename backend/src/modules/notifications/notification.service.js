import { sendEmail } from './email.service.js';
import { logger } from '../../config/logger.js';
import { User } from '../users/user.model.js';

const SUBJECT_MAP = {
  COMMISSION_APPROVED: 'Comisión aprobada',
  COMMISSION_PAID: 'Comisión pagada',
  PAYMENT_RECEIVED: 'Pago recibido',
  INVOICE_STATUS_CHANGED: 'Estado de factura actualizado',
  EVENT_STATUS_CHANGED: 'Estado del evento actualizado',
  SURVEY_COMPLETED: 'Nueva respuesta de encuesta',
  TASK_ASSIGNED: 'Tarea asignada',
  GENERAL: 'Notificación — GEH Events',
};

export async function notify({ userId, type, title, message, actionUrl }) {
  try {
    const user = await User.findById(userId).select('email name');
    if (!user || !user.email) return;

    await sendEmail({
      to: user.email,
      subject: SUBJECT_MAP[type] || title,
      title,
      message,
      actionUrl,
    });
  } catch (err) {
    logger.error({ err, userId, type }, 'Error al enviar notificación por correo');
  }
}

export async function notifyRoles({ roles, type, title, message, actionUrl }) {
  try {
    const users = await User.find({ role: { $in: roles }, status: 'ACTIVO' }).select('email name');
    if (!users.length) return;

    await Promise.all(
      users
        .filter(u => u.email)
        .map(u => sendEmail({
          to: u.email,
          subject: SUBJECT_MAP[type] || title,
          title,
          message,
          actionUrl,
        }))
    );
  } catch (err) {
    logger.error({ err, roles, type }, 'Error al enviar notificaciones por correo a roles');
  }
}
