import { companyRepository } from './company.repository.js';
import { NotFoundError } from '../../core/errors/NotFoundError.js';
import { AppError } from '../../core/errors/AppError.js';
import { audit } from '../audit/audit.service.js';

export const companyService = {
  async listCompanies(query) {
    return companyRepository.findAll(query);
  },

  async listSegments() {
    const segments = await companyRepository.distinctSegments();
    return segments.sort();
  },

  async getCompanyById(id) {
    const company = await companyRepository.findById(id);
    if (!company || !company.active) throw new NotFoundError('Empresa no encontrada');
    return company;
  },

  async createCompany(data, requestingUser, req) {
    const company = await companyRepository.create({
      ...data,
      ownerId: requestingUser.id,
      status: data.status || 'PROSPECTO',
    });

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'companies',
      action: 'CREATE',
      entityId: company._id,
      after: { name: company.name, taxId: company.taxId, segment: company.segment },
      req,
    });

    return company;
  },

  async updateCompany(id, data, requestingUser, req) {
    const company = await companyRepository.findById(id);
    if (!company || !company.active) throw new NotFoundError('Empresa no encontrada');

    const before = { name: company.name, status: company.status, segment: company.segment };
    const updated = await companyRepository.update(id, data);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'companies',
      action: 'UPDATE',
      entityId: id,
      before,
      after: data,
      req,
    });

    return updated;
  },

  async importCompanies(companies, requestingUser, req) {
    const withOwner = companies.map(c => ({
      ...c,
      ownerId: requestingUser.id,
      status: c.status || 'PROSPECTO',
      active: true,
    }));

    const imported = await companyRepository.bulkCreate(withOwner);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'companies',
      action: 'IMPORT',
      entityId: null,
      after: { imported, total: companies.length },
      req,
    });

    return { imported, total: companies.length };
  },

  async deleteCompany(id, requestingUser, req) {
    const company = await companyRepository.findById(id);
    if (!company || !company.active) throw new NotFoundError('Empresa no encontrada');

    const hasRelations = await companyRepository.hasRelations(id);
    if (hasRelations) {
      throw new AppError('No se puede eliminar la empresa porque tiene oportunidades activas', 409, 'HAS_RELATIONS');
    }

    await companyRepository.softDelete(id);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'companies',
      action: 'DELETE',
      entityId: id,
      before: { name: company.name },
      req,
    });
  },
};
