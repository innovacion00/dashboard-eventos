import { userService } from './user.service.js';
import { asyncHandler } from '../../core/utils/async-handler.js';
import { successResponse } from '../../core/utils/response.js';

export const userController = {
  list: asyncHandler(async (req, res) => {
    const { users, meta } = await userService.listUsers(req.query);
    const data = users.map(mapUser);
    successResponse(res, data, 200, meta);
  }),

  getById: asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    successResponse(res, mapUser(user));
  }),

  create: asyncHandler(async (req, res) => {
    const user = await userService.createUser(req.body, req.user, req);
    successResponse(res, mapUser(user), 201);
  }),

  update: asyncHandler(async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body, req.user, req);
    successResponse(res, mapUser(user));
  }),
};

function mapUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
