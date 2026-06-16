import { AppError } from './AppError.js';

export class ForbiddenError extends AppError {
  constructor(message = 'No tienes permiso para realizar esta acción') {
    super(message, 403, 'FORBIDDEN');
  }
}
