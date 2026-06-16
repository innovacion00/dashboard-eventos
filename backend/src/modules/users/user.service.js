import { userRepository } from './user.repository.js';
import { User } from './user.model.js';
import { ConflictError } from '../../core/errors/ConflictError.js';
import { NotFoundError } from '../../core/errors/NotFoundError.js';
import { audit } from '../audit/audit.service.js';

export const userService = {
  async listUsers(query) {
    return userRepository.findAll(query);
  },

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError('Usuario no encontrado');
    return user;
  },

  async createUser(data, requestingUser, req) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw new ConflictError('El correo electrónico ya está registrado');

    const passwordHash = await User.hashPassword(data.password);
    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
      status: 'ACTIVO',
    });

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'users',
      action: 'CREATE',
      entityId: user._id,
      after: { name: user.name, email: user.email, role: user.role },
      req,
    });

    return user;
  },

  async updateUser(id, data, requestingUser, req) {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError('Usuario no encontrado');

    if (data.email && data.email !== user.email) {
      const existing = await userRepository.findByEmail(data.email);
      if (existing) throw new ConflictError('El correo electrónico ya está en uso');
    }

    const before = { name: user.name, email: user.email, role: user.role, status: user.status };
    const updateData = { ...data };

    if (data.password) {
      updateData.passwordHash = await User.hashPassword(data.password);
      delete updateData.password;
    }

    const updated = await userRepository.update(id, updateData);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'users',
      action: 'UPDATE',
      entityId: id,
      before,
      after: updateData,
      req,
    });

    return updated;
  },
};
