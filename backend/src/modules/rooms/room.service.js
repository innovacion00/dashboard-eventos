import { roomRepository } from './room.repository.js';

export const roomService = {
  async listRooms() {
    return roomRepository.findAll();
  },
};
