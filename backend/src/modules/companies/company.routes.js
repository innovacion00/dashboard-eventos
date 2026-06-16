import { Router } from 'express';
import { authMiddleware } from '../../core/middlewares/auth.middleware.js';
import { requireRole } from '../../core/middlewares/authorize.middleware.js';
import { validate } from '../../core/middlewares/validate.middleware.js';
import { companyController } from './company.controller.js';
import { createCompanySchema, updateCompanySchema, importCompaniesSchema } from './company.validation.js';
import { ROLES } from '../../core/constants/roles.js';

const { DIRECCION_GENERAL, LIDER_COMERCIAL, ADMINISTRADOR } = ROLES;

const router = Router();

router.use(authMiddleware);

router.get('/', companyController.list);
router.post('/import', validate(importCompaniesSchema), companyController.importCompanies);
router.post('/', validate(createCompanySchema), companyController.create);
router.get('/:id', companyController.getById);
router.patch('/:id', validate(updateCompanySchema), companyController.update);
router.delete('/:id', requireRole([DIRECCION_GENERAL, LIDER_COMERCIAL, ADMINISTRADOR]), companyController.remove);

router.get('/:id/contacts', companyController.listContacts);
router.get('/:id/activities', companyController.listActivities);
router.get('/:id/opportunities', companyController.listOpportunities);

export { router as companyRouter };
