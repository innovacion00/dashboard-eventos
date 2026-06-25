import { historicalSaleRepository } from './historical-sale.repository.js';
import { NotFoundError } from '../../core/errors/NotFoundError.js';
import { ConflictError } from '../../core/errors/ConflictError.js';
import { audit } from '../audit/audit.service.js';

export const historicalSaleService = {
  async list(query) {
    return historicalSaleRepository.findAll(query);
  },

  async summaryByYear(year) {
    return historicalSaleRepository.summaryByYear(year);
  },

  async create(data, requestingUser, req) {
    const existing = await historicalSaleRepository.findAll({
      year: data.year, month: data.month, executiveId: data.executiveId,
    });
    if (existing.length > 0) {
      throw new ConflictError('Ya existe un registro para este ejecutivo en este mes');
    }

    const sale = await historicalSaleRepository.create({
      ...data,
      createdBy: requestingUser.id,
    });

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'historical-sales',
      action: 'CREATE',
      entityId: sale._id,
      after: { year: data.year, month: data.month, confirmedSales: data.confirmedSales },
      req,
    });

    return sale;
  },

  async update(id, data, requestingUser, req) {
    const sale = await historicalSaleRepository.update(id, data);
    if (!sale) throw new NotFoundError('Registro no encontrado');

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'historical-sales',
      action: 'UPDATE',
      entityId: id,
      after: data,
      req,
    });

    return sale;
  },

  async remove(id, requestingUser, req) {
    const sale = await historicalSaleRepository.softDelete(id);
    if (!sale) throw new NotFoundError('Registro no encontrado');

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'historical-sales',
      action: 'DELETE',
      entityId: id,
      req,
    });
  },
};
