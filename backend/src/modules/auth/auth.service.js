import jwt from 'jsonwebtoken';
import { User } from '../users/user.model.js';
import { audit } from '../audit/audit.service.js';
import { env } from '../../config/env.js';
import { AuthError } from '../../core/errors/AuthError.js';

function buildUserPayload(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function login({ email, password, req }) {
  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user) throw new AuthError('Credenciales incorrectas');
  if (user.status !== 'ACTIVO') throw new AuthError('Tu cuenta no está activa. Contacta al administrador.');

  const valid = await user.comparePassword(password);
  if (!valid) throw new AuthError('Credenciales incorrectas');

  const payload = buildUserPayload(user);
  const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

  user.lastLoginAt = new Date();
  await user.save();

  await audit({
    userId: user._id,
    userEmail: user.email,
    module: 'auth',
    action: 'LOGIN',
    req,
  });

  return { token, user: payload };
}

export async function logout({ req }) {
  if (req.user) {
    await audit({
      userId: req.user.id,
      userEmail: req.user.email,
      module: 'auth',
      action: 'LOGOUT',
      req,
    });
  }
}

export async function getMe(userId) {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) throw new AuthError('Usuario no encontrado');
  return buildUserPayload(user);
}
