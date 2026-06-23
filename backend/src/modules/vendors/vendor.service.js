import { vendorRepository } from './vendor.repository.js';
import { NotFoundError } from '../../core/errors/NotFoundError.js';
import { audit } from '../audit/audit.service.js';

export const vendorService = {
  async listVendors(query) {
    return vendorRepository.findAll(query);
  },

  async getVendorById(id) {
    const vendor = await vendorRepository.findById(id);
    if (!vendor || !vendor.active) throw new NotFoundError('Proveedor no encontrado');
    return vendor;
  },

  async createVendor(data, requestingUser, req) {
    const vendor = await vendorRepository.create(data);
    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'vendors',
      action: 'CREATE',
      entityId: vendor._id,
      after: { name: vendor.name, category: vendor.category },
      req,
    });
    return vendor;
  },

  async updateVendor(id, data, requestingUser, req) {
    const vendor = await vendorRepository.findById(id);
    if (!vendor || !vendor.active) throw new NotFoundError('Proveedor no encontrado');

    const before = { name: vendor.name, category: vendor.category };
    const updated = await vendorRepository.update(id, data);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'vendors',
      action: 'UPDATE',
      entityId: id,
      before,
      after: data,
      req,
    });
    return updated;
  },

  async deleteVendor(id, requestingUser, req) {
    const vendor = await vendorRepository.findById(id);
    if (!vendor || !vendor.active) throw new NotFoundError('Proveedor no encontrado');

    await vendorRepository.softDelete(id);
    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'vendors',
      action: 'DELETE',
      entityId: id,
      before: { name: vendor.name },
      req,
    });
  },
};
