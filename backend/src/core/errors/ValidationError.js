import { AppError } from './AppError.js';

export class ValidationError extends AppError {
  constructor(message = 'Los datos enviados no son válidos', details = null) {
    super(message, 422, 'VALIDATION_ERROR', details);
  }
}
