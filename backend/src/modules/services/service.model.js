import mongoose from 'mongoose';

const SERVICE_CATEGORIES = ['SALON', 'AB', 'AV', 'OTROS'];

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, required: true, enum: SERVICE_CATEGORIES },
    unitPrice: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'unidad' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'services' }
);

serviceSchema.index({ category: 1 });
serviceSchema.index({ active: 1 });

export const Service = mongoose.model('Service', serviceSchema);
