import { invoiceService } from './invoice.service.js';
import { asyncHandler } from '../../core/utils/async-handler.js';
import { successResponse } from '../../core/utils/response.js';

function mapPayment(p) {
  return {
    id: p._id,
    type: p.type,
    amount: p.amount,
    paymentDate: p.paymentDate,
    method: p.method,
    reference: p.reference,
    notes: p.notes,
    file: p.file,
    status: p.status,
    createdAt: p.createdAt,
  };
}

function mapInvoice(inv) {
  return {
    id: inv._id,
    number: inv.number,
    event: inv.eventId
      ? { id: inv.eventId._id, number: inv.eventId.number, name: inv.eventId.name, eventDate: inv.eventId.eventDate }
      : inv.eventId,
    company: inv.companyId
      ? { id: inv.companyId._id, name: inv.companyId.name, taxId: inv.companyId.taxId }
      : inv.companyId,
    quote: inv.quoteId
      ? { id: inv.quoteId._id, number: inv.quoteId.number }
      : undefined,
    status: inv.status,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
    subtotal: inv.subtotal,
    taxRate: inv.taxRate,
    ivaAmount: inv.ivaAmount,
    icoAmount: inv.icoAmount,
    tipRate: inv.tipRate,
    tipAmount: inv.tipAmount,
    taxAmount: inv.taxAmount,
    total: inv.total,
    paidAmount: inv.paidAmount,
    balance: inv.balance,
    payments: (inv.payments || []).map(mapPayment),
    notes: inv.notes,
    createdBy: inv.createdBy,
    createdAt: inv.createdAt,
    updatedAt: inv.updatedAt,
  };
}

export const invoiceController = {
  list: asyncHandler(async (req, res) => {
    const result = await invoiceService.listInvoices(req.query);
    successResponse(res, result.data.map(mapInvoice), 200, result.meta);
  }),

  getById: asyncHandler(async (req, res) => {
    const inv = await invoiceService.getInvoiceById(req.params.id);
    successResponse(res, mapInvoice(inv));
  }),

  create: asyncHandler(async (req, res) => {
    const inv = await invoiceService.createInvoice(req.body, req.user, req);
    successResponse(res, mapInvoice(inv), 201);
  }),

  update: asyncHandler(async (req, res) => {
    const inv = await invoiceService.updateInvoice(req.params.id, req.body, req.user, req);
    successResponse(res, mapInvoice(inv));
  }),

  changeStatus: asyncHandler(async (req, res) => {
    const inv = await invoiceService.changeStatus(req.params.id, req.body.status, req.user, req);
    successResponse(res, mapInvoice(inv));
  }),

  addPayment: asyncHandler(async (req, res) => {
    const filePath = req.file ? `/uploads/invoice-payments/${req.file.filename}` : undefined;
    const paymentData = {
      type: req.body.type,
      amount: Number(req.body.amount),
      paymentDate: req.body.paymentDate,
      method: req.body.method,
      reference: req.body.reference || '',
      notes: req.body.notes || '',
      file: filePath,
    };
    const inv = await invoiceService.addPayment(req.params.id, paymentData, req.user, req);
    successResponse(res, mapInvoice(inv), 201);
  }),

  cancelPayment: asyncHandler(async (req, res) => {
    const inv = await invoiceService.cancelPayment(req.params.id, req.params.paymentId, req.user, req);
    successResponse(res, mapInvoice(inv));
  }),

  remove: asyncHandler(async (req, res) => {
    await invoiceService.deleteInvoice(req.params.id, req.user, req);
    successResponse(res, { message: 'Factura eliminada correctamente' });
  }),
};
