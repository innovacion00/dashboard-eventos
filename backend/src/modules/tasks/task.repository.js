import { Task } from './task.model.js';
import { getPagination, buildMeta } from '../../core/utils/paginate.js';

export const taskRepository = {
  async findAll(query, userId) {
    const { page, limit, skip } = getPagination(query);
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.assignee === 'me') filter.assigneeId = userId;
    else if (query.assignee) filter.assigneeId = query.assignee;

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('assigneeId', 'name email')
        .populate('createdBy', 'name')
        .sort({ dueDate: 1, priority: 1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(filter),
    ]);
    return { tasks, meta: buildMeta(page, limit, total) };
  },

  async findById(id) {
    return Task.findById(id);
  },

  async create(data) {
    return Task.create(data);
  },

  async update(id, data) {
    return Task.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
  },
};
