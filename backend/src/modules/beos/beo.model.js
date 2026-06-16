import mongoose from 'mongoose';

export const BEO_STATUSES = ['BORRADOR', 'EMITIDO', 'CONFIRMADO'];

const setupSchema = new mongoose.Schema({
  type: { type: String },
  chairs: { type: Number },
  tables: { type: Number },
  notes: { type: String },
  readyAt: { type: Date },
}, { _id: false });

const menuItemSchema = new mongoose.Schema({
  time: { type: String },
  description: { type: String, required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  quantity: { type: Number },
  notes: { type: String },
});

const avItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  quantity: { type: Number },
  notes: { type: String },
});

const personnelSchema = new mongoose.Schema({
  role: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  notes: { type: String },
}, { _id: false });

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  service: { type: String },
  contact: { type: String },
  notes: { type: String },
}, { _id: false });

const beoSchema = new mongoose.Schema(
  {
    number: { type: String, unique: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, unique: true },
    setup: { type: setupSchema, default: () => ({}) },
    menu: [menuItemSchema],
    audiovisual: [avItemSchema],
    personnel: [personnelSchema],
    suppliers: [supplierSchema],
    generalNotes: { type: String },
    status: { type: String, enum: BEO_STATUSES, default: 'BORRADOR' },
    issuedAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'beos' }
);

beoSchema.index({ eventId: 1 });

beoSchema.pre('save', async function (next) {
  if (this.isNew && !this.number) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.number = `BEO-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  if (this.isModified('status') && this.status === 'EMITIDO' && !this.issuedAt) {
    this.issuedAt = new Date();
  }
  next();
});

export const Beo = mongoose.model('Beo', beoSchema);
