import mongoose from 'mongoose';

const VENDOR_CATEGORIES = [
  'AB',
  'SALON',
  'AV',
  'OTROS',
  'EXTERNO',
];

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, enum: VENDOR_CATEGORIES },
    contactName: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    nit: { type: String, trim: true },
    address: { type: String, trim: true },
    services: { type: String, trim: true },
    notes: { type: String, trim: true },
    active: { type: Boolean, default: true },
    sedeId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true, collection: 'vendors' }
);

vendorSchema.index({ category: 1 });
vendorSchema.index({ active: 1 });
vendorSchema.index({ name: 1 });

export const Vendor = mongoose.model('Vendor', vendorSchema);
export { VENDOR_CATEGORIES };
