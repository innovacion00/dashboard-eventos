import { roomService } from './room.service.js';
import { asyncHandler } from '../../core/utils/async-handler.js';
import { successResponse } from '../../core/utils/response.js';

export const roomController = {
  list: asyncHandler(async (req, res) => {
    const rooms = await roomService.listRooms();
    successResponse(res, rooms.map(mapRoom));
  }),

  update: asyncHandler(async (req, res) => {
    const { description, name, baseRate, capacities, aliases, photos } = req.body;
    const data = {};
    if (name        !== undefined) data.name        = name;
    if (description !== undefined) data.description = description;
    if (baseRate    !== undefined) data.baseRate     = Number(baseRate);
    if (capacities  !== undefined) data.capacities   = capacities;
    if (aliases     !== undefined) data.aliases      = aliases;
    if (photos      !== undefined) data.photos       = photos;

    const room = await roomService.updateRoom(req.params.id, data, req.user, req);
    successResponse(res, mapRoom(room));
  }),
};

function mapRoom(r) {
  return {
    id: r._id,
    name: r.name,
    aliases: r.aliases,
    description: r.description,
    capacities: r.capacities,
    baseRate: r.baseRate,
    photos: r.photos || [],
    active: r.active,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}
