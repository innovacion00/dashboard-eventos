import { User } from './user.model.js';
import { getPagination, buildMeta } from '../../core/utils/paginate.js';

export const userRepository = {
  async findAll(query) {
    const { page, limit, skip } = getPagination(query);
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.role) filter.role = query.role;
    const [users, total] = await Promise.all([
      User.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);
    return { users, meta: buildMeta(page, limit, total) };
  },

  async findById(id) {
    return User.findById(id);
  },

  async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase() });
  },

  async create(data) {
    return User.create(data);
  },

  async update(id, data) {
    return User.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
  },
};
