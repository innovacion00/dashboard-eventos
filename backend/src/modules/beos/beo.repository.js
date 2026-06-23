import { Beo } from './beo.model.js';

export const beoRepository = {
  async findByEventId(eventId) {
    return Beo.find({ eventId, active: true })
      .populate('createdBy', 'name')
      .populate('menu.serviceId', 'name unit')
      .populate('audiovisual.serviceId', 'name unit')
      .sort({ category: 1 });
  },

  async findByEventIdAndCategory(eventId, category) {
    return Beo.findOne({ eventId, category, active: true });
  },

  async findById(id) {
    return Beo.findById(id)
      .populate({ path: 'eventId', select: 'name number eventDate companyId roomId', populate: [{ path: 'companyId', select: 'name' }, { path: 'roomId', select: 'name' }] })
      .populate('createdBy', 'name')
      .populate('menu.serviceId', 'name unit')
      .populate('audiovisual.serviceId', 'name unit');
  },

  async create(data) {
    const beo = new Beo(data);
    return beo.save();
  },

  async update(id, data) {
    const beo = await Beo.findById(id);
    if (!beo) return null;
    Object.assign(beo, data);
    return beo.save();
  },

  async changeStatus(id, status) {
    const beo = await Beo.findById(id);
    if (!beo) return null;
    beo.status = status;
    return beo.save();
  },
};
