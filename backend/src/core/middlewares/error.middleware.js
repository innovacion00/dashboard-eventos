import { AppError } from '../errors/AppError.js';
import { logger } from '../../config/logger.js';

export function errorMiddleware(err, req, res, next) {
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
  }

  // Error de Mongoose: documento duplicado
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'campo';
    return res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: `Ya existe un registro con ese valor en el campo "${field}"`,
      },
    });
  }

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      issue: e.message,
    }));
    return res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Los datos enviados no son válidos', details },
    });
  }

  // CastError de Mongoose (ID inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_ID', message: 'El identificador proporcionado no es válido' },
    });
  }

  logger.error({ err, req: { method: req.method, url: req.url } }, 'Error no controlado');
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Ha ocurrido un error interno. Intenta de nuevo más tarde.' },
  });
}
