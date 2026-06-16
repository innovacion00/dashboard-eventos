import { Contact } from './contact.model.js';

export const contactRepository = {
  async findById(id) {
    return Contact.findById(id);
  },

  async create(data) {
    return Contact.create(data);
  },

  async update(id, data) {
    return Contact.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
  },

  async softDelete(id) {
    return Contact.findByIdAndUpdate(id, { $set: { active: false } }, { new: true });
  },
};
