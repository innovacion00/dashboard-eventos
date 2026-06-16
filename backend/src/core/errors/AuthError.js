import { AppError } from './AppError.js';

export class AuthError extends AppError {
  constructor(message = 'No autenticado') {
    super(message, 401, 'UNAUTHORIZED');
  }
}
