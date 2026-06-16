import { serviceService } from './service.service.js';
import { asyncHandler } from '../../core/utils/async-handler.js';
import { successResponse } from '../../core/utils/response.js';

export const serviceController = {
  list: asyncHandler(async (req, res) => {
    const { services, meta } = await serviceService.listServices(req.query);
    successResponse(res, services.map(mapService), 200, meta);
  }),

  getById: asyncHandler(async (req, res) => {
    const service = await serviceService.getServiceById(req.params.id);
    successResponse(res, mapService(service));
  }),

  create: asyncHandler(async (req, res) => {
    const service = await serviceService.createService(req.body, req.user, req);
    successResponse(res, mapService(service), 201);
  }),

  update: asyncHandler(async (req, res) => {
    const service = await serviceService.updateService(req.params.id, req.body, req.user, req);
    successResponse(res, mapService(service));
  }),

  remove: asyncHandler(async (req, res) => {
    await serviceService.deleteService(req.params.id, req.user, req);
    successResponse(res, null, 204);
  }),
};

function mapService(s) {
  return {
    id: s._id,
    name: s.name,
    description: s.description,
    category: s.category,
    unitPrice: s.unitPrice,
    unit: s.unit,
    active: s.active,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}
