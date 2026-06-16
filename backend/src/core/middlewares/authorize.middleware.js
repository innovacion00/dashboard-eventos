import { AuthError } from '../errors/AuthError.js';
import { ForbiddenError } from '../errors/ForbiddenError.js';

export function requireRole(allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) return next(new AuthError('No autenticado'));
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('No tienes permiso para realizar esta acción'));
    }
    return next();
  };
}
