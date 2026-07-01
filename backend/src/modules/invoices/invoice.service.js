import { invoiceRepository } from './invoice.repository.js';
import { NotFoundError } from '../../core/errors/NotFoundError.js';
import { AppError } from '../../core/errors/AppError.js';
import { audit } from '../audit/audit.service.js';
import { notifyRoles } from '../notifications/notification.service.js';
import { ROLES } from '../../core/constants/roles.js';

const VALID_TRANSITIONS = {
  BORRADOR: ['EMITIDA', 'ANULADA'],
  EMITIDA: ['VENCIDA', 'ANULADA'],
  PAGADA_PARCIAL: ['VENCIDA', 'ANULADA'],
  PAGADA_TOTAL: [],
  ANULADA: [],
  VENCIDA: ['EMITIDA'],
};

export const invoiceService = {
  async listInvoices(query) {
    return invoiceRepository.findAll(query);
  },

  async getInvoiceById(id) {
    const inv = await invoiceRepository.findById(id);
    if (!inv || !inv.active) throw new NotFoundError('Factura no encontrada');
    return inv;
  },

  // Called automatically when an event is created (manual, desde oportunidad o desde cotización)
  async createFromEvent(event, quote, requestingUser, req) {
    const existing = await invoiceRepository.findByEventId(event._id);
    if (existing) return existing;

    let subtotal = 0;
    let taxRate = 0.19;
    let ivaAmount = 0;
    let icoAmount = 0;
    let tipAmount = 0;
    let tipRate = 0;

    if (quote && quote.subtotal > 0) {
      subtotal = quote.subtotal;
      ivaAmount = quote.ivaAmount || 0;
      icoAmount = quote.icoAmount || 0;
      const totalTax = ivaAmount + icoAmount;
      taxRate = Math.round((totalTax / subtotal) * 10000) / 10000;

      const tipItem = (quote.items || []).find(i => i.description === 'Propina' && i.category === 'AB');
      if (tipItem) {
        tipAmount = tipItem.total || tipItem.unitPrice || 0;
        const abBase = (quote.items || [])
          .filter(i => i.category === 'AB' && i.description !== 'Propina')
          .reduce((s, i) => s + (i.total || 0), 0);
        tipRate = abBase > 0 ? Math.round((tipAmount / abBase) * 10000) / 100 : 0;
      }
    } else {
      subtotal = event.totalValue || 0;
    }

    const companyId = event.companyId?._id || event.companyId;
    const quoteId = event.quoteId?._id || event.quoteId || undefined;

    const inv = await invoiceRepository.create({
      eventId: event._id,
      companyId,
      quoteId,
      subtotal,
      taxRate,
      ivaAmount,
      icoAmount,
      tipAmount,
      tipRate,
      createdBy: requestingUser.id,
    });

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'invoices',
      action: 'CREATE',
      entityId: inv._id,
      after: { number: inv.number, total: inv.total, eventId: event._id, source: 'auto-from-event' },
      req,
    });

    return inv;
  },

  async createInvoice(data, requestingUser, req) {
    const inv = await invoiceRepository.create({ ...data, createdBy: requestingUser.id });

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'invoices',
      action: 'CREATE',
      entityId: inv._id,
      after: { number: inv.number, total: inv.total, eventId: inv.eventId },
      req,
    });

    return inv;
  },

  async updateInvoice(id, data, requestingUser, req) {
    const inv = await invoiceRepository.findById(id);
    if (!inv || !inv.active) throw new NotFoundError('Factura no encontrada');
    if (inv.status !== 'BORRADOR') {
      throw new AppError('Solo se pueden editar facturas en borrador', 409, 'INVALID_STATE');
    }

    const before = { subtotal: inv.subtotal, total: inv.total };
    const updated = await invoiceRepository.update(id, data);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'invoices',
      action: 'UPDATE',
      entityId: id,
      before,
      after: { subtotal: updated.subtotal, total: updated.total },
      req,
    });

    return updated;
  },

  async changeStatus(id, newStatus, requestingUser, req) {
    const inv = await invoiceRepository.findById(id);
    if (!inv || !inv.active) throw new NotFoundError('Factura no encontrada');

    const allowed = VALID_TRANSITIONS[inv.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new AppError(
        `No se puede cambiar de ${inv.status} a ${newStatus}`,
        409,
        'INVALID_TRANSITION'
      );
    }

    const before = { status: inv.status };
    const updated = await invoiceRepository.changeStatus(id, newStatus);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'invoices',
      action: 'UPDATE',
      entityId: id,
      before,
      after: { status: newStatus },
      req,
    });

    return updated;
  },

  async addPayment(id, paymentData, requestingUser, req) {
    const inv = await invoiceRepository.findById(id);
    if (!inv || !inv.active) throw new NotFoundError('Factura no encontrada');
    if (inv.status === 'ANULADA' || inv.status === 'PAGADA_TOTAL') {
      throw new AppError('No se pueden agregar pagos a esta factura', 409, 'INVALID_STATE');
    }
    if (inv.status === 'BORRADOR') {
      throw new AppError('Emita la factura antes de registrar pagos', 409, 'INVALID_STATE');
    }

    const updated = await invoiceRepository.addPayment(id, {
      ...paymentData,
      createdBy: requestingUser.id,
    });

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'invoices',
      action: 'UPDATE',
      entityId: id,
      after: { payment: paymentData.amount, newBalance: updated.balance, status: updated.status },
      req,
    });

    await notifyRoles({
      roles: [ROLES.FINANCIERO, ROLES.DIRECCION_GENERAL],
      type: 'PAYMENT_RECEIVED',
      title: 'Pago recibido',
      message: `Se registró un pago en la factura ${inv.number}.`,
      actionUrl: `/facturas/${id}`,
    });

    return updated;
  },

  async cancelPayment(invoiceId, paymentId, requestingUser, req) {
    const inv = await invoiceRepository.findById(invoiceId);
    if (!inv || !inv.active) throw new NotFoundError('Factura no encontrada');

    const updated = await invoiceRepository.cancelPayment(invoiceId, paymentId);
    if (!updated) throw new NotFoundError('Pago no encontrado');

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'invoices',
      action: 'UPDATE',
      entityId: invoiceId,
      after: { paymentCancelled: paymentId, newBalance: updated.balance },
      req,
    });

    return updated;
  },

  async addDocument(id, docData, requestingUser, req) {
    const inv = await invoiceRepository.findById(id);
    if (!inv || !inv.active) throw new NotFoundError('Factura no encontrada');
    inv.documents.push(docData);
    const updated = await inv.save();
    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'invoices',
      action: 'UPDATE',
      entityId: id,
      after: { documentType: docData.type, filename: docData.filename },
      req,
    });
    return invoiceRepository.findById(id);
  },

  async removeDocument(id, docId, requestingUser, req) {
    const inv = await invoiceRepository.findById(id);
    if (!inv || !inv.active) throw new NotFoundError('Factura no encontrada');
    inv.documents.id(docId)?.deleteOne();
    await inv.save();
    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'invoices',
      action: 'UPDATE',
      entityId: id,
      after: { removedDocumentId: docId },
      req,
    });
    return invoiceRepository.findById(id);
  },

  async deleteInvoice(id, requestingUser, req) {
    const inv = await invoiceRepository.findById(id);
    if (!inv || !inv.active) throw new NotFoundError('Factura no encontrada');
    if (inv.status !== 'BORRADOR') {
      throw new AppError('Solo se pueden eliminar facturas en borrador', 409, 'INVALID_STATE');
    }

    await invoiceRepository.softDelete(id);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'invoices',
      action: 'DELETE',
      entityId: id,
      before: { number: inv.number, status: inv.status },
      req,
    });
  },
};
