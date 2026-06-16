import mongoose from 'mongoose';

export const QUOTE_STATUSES = ['BORRADOR', 'EN_REVISION', 'APROBADA', 'RECHAZADA', 'VENCIDA'];
const ITEM_CATEGORIES = ['SALON', 'AB', 'AV', 'OTROS'];

const lineItemSchema = new mongoose.Schema({
  description: { type: String, required: true, trim: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, default: 0 },
  category: { type: String, enum: ITEM_CATEGORIES, default: 'OTROS' },
});

const quoteSchema = new mongoose.Schema(
  {
    number: { type: String, unique: true },
    version: { type: Number, default: 1 },
    opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    status: { type: String, enum: QUOTE_STATUSES, default: 'BORRADOR' },
    validUntil: { type: Date },
    eventDate: { type: Date },
    eventType: { type: String },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    attendees: { type: Number, min: 1 },
    items: [lineItemSchema],
    subtotal: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0.19 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
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
  for (const item of this.items) {
    item.total = item.quantity * item.unitPrice;
    subtotal += item.total;
  }
  this.subtotal = subtotal;
  this.taxAmount = Math.round(subtotal * this.taxRate * 100) / 100;
  this.total = Math.round((subtotal + this.taxAmount) * 100) / 100;

  // Auto-generate quote number on creation
  if (this.isNew && !this.number) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.number = `COT-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export const Quote = mongoose.model('Quote', quoteSchema);
