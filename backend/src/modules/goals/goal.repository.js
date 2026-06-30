import { Goal } from './goal.model.js';

export const goalRepository = {
  async findByYearMonth(year, month, userId) {
    const filter = { year: Number(year), month: Number(month) };
    if (userId) filter.userId = userId;
    else filter.userId = { $exists: false };
    return Goal.findOne(filter).populate('userId', 'name email');
  },

  async findAll(query = {}) {
    const filter = {};
    if (query.year) filter.year = Number(query.year);
    if (query.month) filter.month = Number(query.month);
    if (query.userId) filter.userId = query.userId;
    return Goal.find(filter)
      .populate('userId', 'name email')
      .sort({ year: -1, month: -1 });
  },

  async findById(id) {
    return Goal.findById(id).populate('userId', 'name email');
  },

  async create(data) {
    return Goal.create(data);
  },

  async update(id, data) {
    return Goal.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
      .populate('userId', 'name email');
  },

  async remove(id) {
    return Goal.findByIdAndDelete(id);
  },
};
