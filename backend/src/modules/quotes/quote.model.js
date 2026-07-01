import mongoose from 'mongoose';

export const QUOTE_STATUSES = ['BORRADOR', 'EN_REVISION', 'APROBADA', 'RECHAZADA', 'VENCIDA'];
const ITEM_CATEGORIES = ['SALON', 'AB', 'AV', 'OTROS', 'EXTERNO'];

const lineItemSchema = new mongoose.Schema({
  description: { type: String, required: true, trim: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, default: 0 },
  category: { type: String, enum: ITEM_CATEGORIES, default: 'OTROS' },
});

const lodgingParamsSchema = new mongoose.Schema({
  checkIn:  { type: String },
  nights:   { type: Number },
  adults:   { type: Number },
  children: { type: Number },
}, { _id: false });

const quoteSchema = new mongoose.Schema(
  {
    number: { type: String, unique: true },
    version: { type: Number, default: 1 },
    opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    status: { type: String, enum: QUOTE_STATUSES, default: 'BORRADOR' },
    validUntil: { type: Date },
    eventDate: { type: Date },
    eventTime: { type: String },
    eventType: { type: String },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    attendees: { type: Number, min: 1 },
    items: [lineItemSchema],
    subtotal: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0.19 },
    icoAmount: { type: Number, default: 0 },
    ivaAmount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    lodging: { type: lodgingParamsSchema },
    notes: { type: String },
    internalNotes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'quotes' }
);

quoteSchema.index({ opportunityId: 1 });
quoteSchema.index({ companyId: 1 });
quoteSchema.index({ status: 1 });

quoteSchema.pre('save', async function (next) {
  // Recalculate item totals and document totals
  let subtotal = 0;
  let icoBase  = 0;
  for (const item of this.items) {
    item.total = item.quantity * item.unitPrice;
    subtotal += item.total;
    if (item.category === 'AB') icoBase += item.total;
  }
  const ivaBase  = subtotal - icoBase;
  this.subtotal  = subtotal;
  this.ivaAmount = Math.round(ivaBase * (this.taxRate || 0.19) * 100) / 100;
  this.icoAmount = Math.round(icoBase * 0.08 * 100) / 100;
  this.taxAmount = Math.round((this.ivaAmount + this.icoAmount) * 100) / 100;
  this.total     = Math.round((subtotal + this.taxAmount) * 100) / 100;

  if (this.isNew && !this.number) {
    const { nextSequence } = await import('../../core/utils/next-sequence.js');
    const year = new Date().getFullYear();
    const prefix = `COT-${year}-`;
    const seq = await nextSequence(this.constructor, prefix);
    this.number = `${prefix}${String(seq).padStart(4, '0')}`;
  }
  next();
});

export const Quote = mongoose.model('Quote', quoteSchema);
