import { contactRepository } from './contact.repository.js';
import { companyRepository } from '../companies/company.repository.js';
import { NotFoundError } from '../../core/errors/NotFoundError.js';
import { audit } from '../audit/audit.service.js';

export const contactService = {
  async createContact(data, requestingUser, req) {
    const company = await companyRepository.findById(data.companyId);
    if (!company || !company.active) throw new NotFoundError('Empresa no encontrada');

    const contact = await contactRepository.create(data);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'contacts',
      action: 'CREATE',
      entityId: contact._id,
      after: { fullName: contact.fullName, companyId: contact.companyId },
      req,
    });

    return contact;
  },

  async updateContact(id, data, requestingUser, req) {
    const contact = await contactRepository.findById(id);
    if (!contact || !contact.active) throw new NotFoundError('Contacto no encontrado');

    const before = { fullName: contact.fullName, email: contact.email, position: contact.position };
    const updated = await contactRepository.update(id, data);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'contacts',
      action: 'UPDATE',
      entityId: id,
      before,
      after: data,
      req,
    });

    return updated;
  },

  async deleteContact(id, requestingUser, req) {
    const contact = await contactRepository.findById(id);
    if (!contact || !contact.active) throw new NotFoundError('Contacto no encontrado');

    await contactRepository.softDelete(id);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'contacts',
      action: 'DELETE',
      entityId: id,
      before: { fullName: contact.fullName },
      req,
    });
  },
};
