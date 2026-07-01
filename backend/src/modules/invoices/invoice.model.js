import mongoose from 'mongoose';

export const INVOICE_STATUSES = ['BORRADOR', 'EMITIDA', 'PAGADA_PARCIAL', 'PAGADA_TOTAL', 'ANULADA', 'VENCIDA'];
export const PAYMENT_METHODS = ['TRANSFERENCIA', 'EFECTIVO', 'CHEQUE', 'TARJETA', 'OTRO'];
export const PAYMENT_TYPES = ['ANTICIPO', 'PAGO_PARCIAL', 'PAGO_TOTAL', 'AJUSTE'];
export const PAYMENT_STATUSES = ['PENDIENTE', 'RECIBIDO', 'CONCILIADO', 'ANULADO'];
export const DOCUMENT_TYPES = ['RETENCION', 'EVIDENCIA_FOTOGRAFICA', 'EVIDENCIA_FACTURA'];

const documentSchema = new mongoose.Schema(
  {
    type: { type: String, enum: DOCUMENT_TYPES, required: true },
    file: { type: String, required: true },
    filename: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const paymentSchema = new mongoose.Schema(
  {
    type: { type: String, enum: PAYMENT_TYPES, required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentDate: { type: Date, required: true },
    method: { type: String, enum: PAYMENT_METHODS, required: true },
    reference: { type: String, trim: true },
    notes: { type: String },
    file: { type: String },
    status: { type: String, enum: PAYMENT_STATUSES, default: 'RECIBIDO' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const invoiceSchema = new mongoose.Schema(
  {
    number: { type: String, unique: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    quoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quote' },
    status: { type: String, enum: INVOICE_STATUSES, default: 'BORRADOR' },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    subtotal: { type: Number, default: 0, min: 0 },
    taxRate: { type: Number, default: 0.19, min: 0, max: 1 },
    ivaAmount: { type: Number, default: 0, min: 0 },
    icoAmount: { type: Number, default: 0, min: 0 },
    tipRate: { type: Number, default: 0, min: 0 },
    tipAmount: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    payments: [paymentSchema],
    documents: [documentSchema],
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'invoices' }
);

invoiceSchema.index({ eventId: 1 });
invoiceSchema.index({ companyId: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ issueDate: 1 });
invoiceSchema.index({ dueDate: 1 });

invoiceSchema.pre('save', async function (next) {
  if (this.isNew && !this.number) {
    const { nextSequence } = await import('../../core/utils/next-sequence.js');
    const year = new Date().getFullYear();
    const prefix = `FAC-${year}-`;
    const seq = await nextSequence(this.constructor, prefix);
    this.number = `${prefix}${String(seq).padStart(4, '0')}`;
  }

  if (!this.icoAmount && !this.ivaAmount) {
    this.ivaAmount = Math.round(this.subtotal * this.taxRate * 100) / 100;
  }
  this.taxAmount = Math.round(((this.ivaAmount || 0) + (this.icoAmount || 0)) * 100) / 100;
  this.total = Math.round((this.subtotal + this.taxAmount) * 100) / 100;

  this.paidAmount = this.payments
    .filter((p) => p.status !== 'ANULADO')
    .reduce((sum, p) => sum + p.amount, 0);
  this.paidAmount = Math.round(this.paidAmount * 100) / 100;
  this.balance = Math.round((this.total - this.paidAmount) * 100) / 100;

  if (this.status === 'EMITIDA' || this.status === 'PAGADA_PARCIAL') {
    if (this.balance <= 0) this.status = 'PAGADA_TOTAL';
    else if (this.paidAmount > 0) this.status = 'PAGADA_PARCIAL';
  }

  next();
});

export const Invoice = mongoose.model('Invoice', invoiceSchema);
