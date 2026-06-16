import { asyncHandler } from '../../core/utils/async-handler.js';
import { successResponse } from '../../core/utils/response.js';
import * as authService from './auth.service.js';

export const loginController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password, req });
  return successResponse(res, result, 200);
});

export const logoutController = asyncHandler(async (req, res) => {
  await authService.logout({ req });
  return successResponse(res, { message: 'Sesión cerrada correctamente' });
});

export const getMeController = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  return successResponse(res, user);
});
