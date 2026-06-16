import { serviceRepository } from './service.repository.js';
import { NotFoundError } from '../../core/errors/NotFoundError.js';
import { audit } from '../audit/audit.service.js';

export const serviceService = {
  async listServices(query) {
    return serviceRepository.findAll(query);
  },

  async getServiceById(id) {
    const service = await serviceRepository.findById(id);
    if (!service || !service.active) throw new NotFoundError('Servicio no encontrado');
    return service;
  },

  async createService(data, requestingUser, req) {
    const service = await serviceRepository.create(data);
    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'services',
      action: 'CREATE',
      entityId: service._id,
      after: { name: service.name, category: service.category, unitPrice: service.unitPrice },
      req,
    });
    return service;
  },

  async updateService(id, data, requestingUser, req) {
    const service = await serviceRepository.findById(id);
    if (!service || !service.active) throw new NotFoundError('Servicio no encontrado');

    const before = { name: service.name, unitPrice: service.unitPrice };
    const updated = await serviceRepository.update(id, data);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'services',
      action: 'UPDATE',
      entityId: id,
      before,
      after: data,
      req,
    });
    return updated;
  },

  async deleteService(id, requestingUser, req) {
    const service = await serviceRepository.findById(id);
    if (!service || !service.active) throw new NotFoundError('Servicio no encontrado');

    await serviceRepository.softDelete(id);
    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'services',
      action: 'DELETE',
      entityId: id,
      before: { name: service.name },
      req,
    });
  },
};
