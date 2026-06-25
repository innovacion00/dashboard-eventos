import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { requestLogger } from './core/middlewares/request-logger.middleware.js';
import { errorMiddleware } from './core/middlewares/error.middleware.js';
import { NotFoundError } from './core/errors/NotFoundError.js';

import { authRouter } from './modules/auth/auth.routes.js';
import { auditRouter } from './modules/audit/audit.routes.js';
import { catalogRouter } from './modules/catalogs/catalog.routes.js';
import { userRouter } from './modules/users/user.routes.js';
import { companyRouter } from './modules/companies/company.routes.js';
import { contactRouter } from './modules/contacts/contact.routes.js';
import { activityRouter } from './modules/activities/activity.routes.js';
import { opportunityRouter } from './modules/opportunities/opportunity.routes.js';
import { taskRouter } from './modules/tasks/task.routes.js';
import { goalRouter } from './modules/goals/goal.routes.js';
import { roomRouter } from './modules/rooms/room.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { serviceRouter } from './modules/services/service.routes.js';
import { quoteRouter } from './modules/quotes/quote.routes.js';
import { eventRouter } from './modules/events/event.routes.js';
import { beoRouter } from './modules/beos/beo.routes.js';
import { invoiceRouter } from './modules/invoices/invoice.routes.js';
import { eventCostRouter } from './modules/event-costs/event-cost.routes.js';
import { commissionRouter } from './modules/commissions/commission.routes.js';
import { vendorRouter } from './modules/vendors/vendor.routes.js';
import { surveyRouter } from './modules/surveys/survey.routes.js';
import { planningRouter } from './modules/planning/planning.routes.js';
import { historicalSaleRouter } from './modules/historical-sales/historical-sale.routes.js';

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(requestLogger);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/companies', companyRouter);
app.use('/api/v1/contacts', contactRouter);
app.use('/api/v1/activities', activityRouter);
app.use('/api/v1/opportunities', opportunityRouter);
app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/goals', goalRouter);
app.use('/api/v1/rooms', roomRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/audit-logs', auditRouter);
app.use('/api/v1/catalogs', catalogRouter);
app.use('/api/v1/services', serviceRouter);
app.use('/api/v1/quotes', quoteRouter);
app.use('/api/v1/events', eventRouter);
app.use('/api/v1/beos', beoRouter);
app.use('/api/v1/invoices', invoiceRouter);
app.use('/api/v1/event-costs', eventCostRouter);
app.use('/api/v1/commissions', commissionRouter);
app.use('/api/v1/vendors', vendorRouter);
app.use('/api/v1/surveys', surveyRouter);
app.use('/api/v1/planning', planningRouter);
app.use('/api/v1/historical-sales', historicalSaleRouter);

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', env: env.NODE_ENV } });
});

app.use((_req, _res, next) => {
  next(new NotFoundError('Ruta no encontrada'));
});

app.use(errorMiddleware);

export { app };
