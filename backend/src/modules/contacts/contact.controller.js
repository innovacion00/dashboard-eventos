import { contactService } from './contact.service.js';
import { asyncHandler } from '../../core/utils/async-handler.js';
import { successResponse } from '../../core/utils/response.js';

export const contactController = {
  create: asyncHandler(async (req, res) => {
    const contact = await contactService.createContact(req.body, req.user, req);
    successResponse(res, contact, 201);
  }),

  update: asyncHandler(async (req, res) => {
    const contact = await contactService.updateContact(req.params.id, req.body, req.user, req);
    successResponse(res, contact);
  }),

  remove: asyncHandler(async (req, res) => {
    await contactService.deleteContact(req.params.id, req.user, req);
    successResponse(res, null, 204);
  }),
};
