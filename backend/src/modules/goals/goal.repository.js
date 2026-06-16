import { Goal } from './goal.model.js';

export const goalRepository = {
  async findByYearMonth(year, month) {
    return Goal.findOne({ year: Number(year), month: Number(month) });
  },

  async findAll() {
    return Goal.find().sort({ year: -1, month: -1 });
  },

  async findById(id) {
    return Goal.findById(id);
  },

  async create(data) {
    return Goal.create(data);
  },

  async update(id, data) {
    return Goal.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
  },
};
