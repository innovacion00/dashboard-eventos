import { companyService } from './company.service.js';
import { asyncHandler } from '../../core/utils/async-handler.js';
import { successResponse } from '../../core/utils/response.js';
import { Contact } from '../contacts/contact.model.js';
import { Activity } from '../activities/activity.model.js';
import { Opportunity } from '../opportunities/opportunity.model.js';
import { getPagination, buildMeta } from '../../core/utils/paginate.js';

export const companyController = {
  listSegments: asyncHandler(async (req, res) => {
    const segments = await companyService.listSegments();
    successResponse(res, segments);
  }),

  list: asyncHandler(async (req, res) => {
    const { companies, meta } = await companyService.listCompanies(req.query);
    successResponse(res, companies.map(mapCompany), 200, meta);
  }),

  getById: asyncHandler(async (req, res) => {
    const company = await companyService.getCompanyById(req.params.id);
    successResponse(res, mapCompany(company));
  }),

  create: asyncHandler(async (req, res) => {
    const company = await companyService.createCompany(req.body, req.user, req);
    successResponse(res, mapCompany(company), 201);
  }),

  update: asyncHandler(async (req, res) => {
    const company = await companyService.updateCompany(req.params.id, req.body, req.user, req);
    successResponse(res, mapCompany(company));
  }),

  importCompanies: asyncHandler(async (req, res) => {
    const result = await companyService.importCompanies(req.body.companies, req.user, req);
    successResponse(res, result, 201);
  }),

  remove: asyncHandler(async (req, res) => {
    await companyService.deleteCompany(req.params.id, req.user, req);
    successResponse(res, null, 204);
  }),

  listContacts: asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { companyId: req.params.id, active: true };
    const [contacts, total] = await Promise.all([
      Contact.find(filter).sort({ fullName: 1 }).skip(skip).limit(limit),
      Contact.countDocuments(filter),
    ]);
    successResponse(res, contacts, 200, buildMeta(page, limit, total));
  }),

  listActivities: asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const [rawActivities, total] = await Promise.all([
      Activity.find({ companyId: req.params.id }).sort({ date: -1 }).skip(skip).limit(limit),
      Activity.countDocuments({ companyId: req.params.id }),
    ]);
    const base = `${req.protocol}://${req.get('host')}/uploads/activities`;
    const activities = rawActivities.map((a) => {
      const obj = a.toObject();
      obj.attachments = (obj.attachments || []).map((att) => ({
        ...att,
        url: `${base}/${att.filename}`,
      }));
      return obj;
    });
    successResponse(res, activities, 200, buildMeta(page, limit, total));
  }),

  listOpportunities: asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { companyId: req.params.id, active: true };
    const [opportunities, total] = await Promise.all([
      Opportunity.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Opportunity.countDocuments(filter),
    ]);
    successResponse(res, opportunities, 200, buildMeta(page, limit, total));
  }),
};

function mapCompany(c) {
  return {
    id: c._id,
    name: c.name,
    segment: c.segment,
    status: c.status,
    contactName: c.contactName,
    contactPosition: c.contactPosition,
    phone: c.phone,
    email: c.email,
    address: c.address,
    owner: c.ownerId,
    lastContactAt: c.lastContactAt,
    nextActionAt: c.nextActionAt,
    nextActionDescription: c.nextActionDescription,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}
