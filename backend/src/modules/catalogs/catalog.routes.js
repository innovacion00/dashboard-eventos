import { Router } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware.js';
import { asyncHandler } from '../../core/utils/async-handler.js';
import { successResponse } from '../../core/utils/response.js';
import { Catalog } from './catalog.model.js';

export const catalogRouter = Router();

catalogRouter.get(
  '/',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const filter = { active: true };
    if (req.query.type) filter.type = req.query.type;

    const items = await Catalog.find(filter).sort({ type: 1, order: 1 }).lean();
    return successResponse(res, items);
  })
);
