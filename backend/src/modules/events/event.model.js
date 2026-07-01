import mongoose from 'mongoose';

export const EVENT_STATUSES = ['CONFIRMADO', 'EN_PRODUCCION', 'REALIZADO', 'CANCELADO', 'POSPUESTO'];
export const SETUP_TYPES = ['AUDITORIO', 'ESCUELA', 'U_SHAPE', 'COCTEL', 'BANQUETE'];

const eventSchema = new mongoose.Schema(
  {
    number: { type: String, unique: true },
    opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity' },
    quoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quote' },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    eventType: { type: String },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    eventDate: { type: Date, required: true },
    startTime: { type: String },
    endTime: { type: String },
    attendees: { type: Number, min: 1 },
    setupType: { type: String, enum: SETUP_TYPES },
    status: { type: String, enum: EVENT_STATUSES, default: 'CONFIRMADO' },
    totalValue: { type: Number, default: 0 },
    notes: { type: String },
    active: { type: Boolean, default: true },
    sedeId: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true, collection: 'events' }
);

eventSchema.index({ companyId: 1 });
eventSchema.index({ opportunityId: 1 });
eventSchema.index({ eventDate: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ ownerId: 1 });

eventSchema.pre('save', async function (next) {
  if (this.isNew && !this.number) {
    const { nextSequence } = await import('../../core/utils/next-sequence.js');
    const year = new Date().getFullYear();
    const prefix = `EVT-${year}-`;
    const seq = await nextSequence(this.constructor, prefix);
    this.number = `${prefix}${String(seq).padStart(4, '0')}`;
  }
  next();
});

export const Event = mongoose.model('Event', eventSchema);
