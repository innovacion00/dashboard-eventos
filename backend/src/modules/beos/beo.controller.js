import { beoService } from './beo.service.js';
import { asyncHandler } from '../../core/utils/async-handler.js';
import { successResponse } from '../../core/utils/response.js';

export const beoController = {
  getByEvent: asyncHandler(async (req, res) => {
    const beo = await beoService.getByEventId(req.params.eventId);
    successResponse(res, beo ? mapBeo(beo) : null);
  }),

  create: asyncHandler(async (req, res) => {
    const beo = await beoService.createBeo(req.body, req.user, req);
    successResponse(res, mapBeo(beo), 201);
  }),

  update: asyncHandler(async (req, res) => {
    const beo = await beoService.updateBeo(req.params.id, req.body, req.user, req);
    successResponse(res, mapBeo(beo));
  }),

  changeStatus: asyncHandler(async (req, res) => {
    const beo = await beoService.changeStatus(req.params.id, req.body.status, req.user, req);
    successResponse(res, mapBeo(beo));
  }),
};

function mapBeo(b) {
  return {
    id: b._id,
    number: b.number,
    eventId: b.eventId,
    setup: b.setup,
    menu: b.menu,
    audiovisual: b.audiovisual,
    personnel: b.personnel,
    suppliers: b.suppliers,
    generalNotes: b.generalNotes,
    status: b.status,
    issuedAt: b.issuedAt,
    createdBy: b.createdBy,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}
