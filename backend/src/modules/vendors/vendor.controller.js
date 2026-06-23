import { vendorService } from './vendor.service.js';
import { asyncHandler } from '../../core/utils/async-handler.js';
import { successResponse } from '../../core/utils/response.js';

export const vendorController = {
  list: asyncHandler(async (req, res) => {
    const { vendors, meta } = await vendorService.listVendors(req.query);
    successResponse(res, vendors.map(mapVendor), 200, meta);
  }),

  getById: asyncHandler(async (req, res) => {
    const vendor = await vendorService.getVendorById(req.params.id);
    successResponse(res, mapVendor(vendor));
  }),

  create: asyncHandler(async (req, res) => {
    const vendor = await vendorService.createVendor(req.body, req.user, req);
    successResponse(res, mapVendor(vendor), 201);
  }),

  update: asyncHandler(async (req, res) => {
    const vendor = await vendorService.updateVendor(req.params.id, req.body, req.user, req);
    successResponse(res, mapVendor(vendor));
  }),

  remove: asyncHandler(async (req, res) => {
    await vendorService.deleteVendor(req.params.id, req.user, req);
    successResponse(res, null, 204);
  }),
};

function mapVendor(v) {
  return {
    id: v._id,
    name: v.name,
    category: v.category,
    contactName: v.contactName,
    phone: v.phone,
    email: v.email,
    nit: v.nit,
    address: v.address,
    services: v.services,
    notes: v.notes,
    active: v.active,
    createdAt: v.createdAt,
    updatedAt: v.updatedAt,
  };
}
