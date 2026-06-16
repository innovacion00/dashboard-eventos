import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AuthError } from '../errors/AuthError.js';
import { asyncHandler } from '../utils/async-handler.js';

export const authMiddleware = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthError('Token de autenticación requerido');
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    throw new AuthError('Token inválido o expirado');
  }
});
