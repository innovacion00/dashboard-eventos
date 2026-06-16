import { roomService } from './room.service.js';
import { asyncHandler } from '../../core/utils/async-handler.js';
import { successResponse } from '../../core/utils/response.js';

export const roomController = {
  list: asyncHandler(async (req, res) => {
    const rooms = await roomService.listRooms();
    successResponse(res, rooms);
  }),
};
