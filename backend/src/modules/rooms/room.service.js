import { roomRepository } from './room.repository.js';
import { NotFoundError } from '../../core/errors/NotFoundError.js';
import { audit } from '../audit/audit.service.js';

export const roomService = {
  async listRooms() {
    return roomRepository.findAll();
  },

  async updateRoom(id, data, requestingUser, req) {
    const room = await roomRepository.findById(id);
    if (!room || !room.active) throw new NotFoundError('Salón no encontrado');

    const before = { description: room.description, photos: room.photos };
    const updated = await roomRepository.update(id, data);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'rooms',
      action: 'UPDATE',
      entityId: id,
      before,
      after: data,
      req,
    });

    return updated;
  },
};
