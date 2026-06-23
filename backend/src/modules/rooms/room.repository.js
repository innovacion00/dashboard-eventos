import { Room } from './room.model.js';

export const roomRepository = {
  async findAll() {
    return Room.find({ active: true }).sort({ name: 1 });
  },

  async findById(id) {
    return Room.findById(id);
  },

  async create(data) {
    return Room.create(data);
  },

  async update(id, data) {
    return Room.findByIdAndUpdate(id, { $set: data }, { new: true });
  },

  async addPhoto(id, filename) {
    return Room.findByIdAndUpdate(id, { $push: { photos: filename } }, { new: true });
  },

  async removePhoto(id, filename) {
    return Room.findByIdAndUpdate(id, { $pull: { photos: filename } }, { new: true });
  },
};
