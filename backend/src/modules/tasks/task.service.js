import { taskRepository } from './task.repository.js';
import { NotFoundError } from '../../core/errors/NotFoundError.js';
import { AppError } from '../../core/errors/AppError.js';
import { audit } from '../audit/audit.service.js';

const VALID_STATUSES = ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA', 'VENCIDA'];

export const taskService = {
  async listTasks(query, requestingUser) {
    return taskRepository.findAll(query, requestingUser.id);
  },

  async createTask(data, requestingUser, req) {
    const task = await taskRepository.create({
      ...data,
      createdBy: requestingUser.id,
      assigneeId: data.assigneeId || requestingUser.id,
    });

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'tasks',
      action: 'CREATE',
      entityId: task._id,
      after: { title: task.title, status: task.status, priority: task.priority },
      req,
    });

    return task;
  },

  async updateTask(id, data, requestingUser, req) {
    const task = await taskRepository.findById(id);
    if (!task) throw new NotFoundError('Tarea no encontrada');

    const before = { title: task.title, status: task.status, priority: task.priority };
    const updated = await taskRepository.update(id, data);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'tasks',
      action: 'UPDATE',
      entityId: id,
      before,
      after: data,
      req,
    });

    return updated;
  },

  async changeStatus(id, newStatus, requestingUser, req) {
    if (!VALID_STATUSES.includes(newStatus)) {
      throw new AppError('Estado de tarea inválido', 422, 'VALIDATION_ERROR');
    }

    const task = await taskRepository.findById(id);
    if (!task) throw new NotFoundError('Tarea no encontrada');

    const updateData = { status: newStatus };
    if (newStatus === 'COMPLETADA') updateData.completedAt = new Date();

    const updated = await taskRepository.update(id, updateData);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'tasks',
      action: 'UPDATE',
      entityId: id,
      before: { status: task.status },
      after: updateData,
      req,
    });

    return updated;
  },
};
