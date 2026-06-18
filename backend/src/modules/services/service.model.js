import mongoose from 'mongoose';

const SERVICE_CATEGORIES = ['SALON', 'AB', 'AV', 'OTROS'];

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, required: true, enum: SERVICE_CATEGORIES },
    unitPrice: { type: Number, required: true, min: 0 },
    taxRate: { type: Number },
    unit: { type: String, default: 'unidad' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'services' }
);

// AB: 8% IVA, resto de categorías: 19% IVA
serviceSchema.pre('save', function () {
  this.taxRate = this.category === 'AB' ? 8 : 19;
});

serviceSchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate();
  const data = update?.$set || update;
  if (data?.category !== undefined) {
    const rate = data.category === 'AB' ? 8 : 19;
    if (update.$set) update.$set.taxRate = rate;
    else update.taxRate = rate;
  }
});

serviceSchema.index({ category: 1 });
serviceSchema.index({ active: 1 });

export const Service = mongoose.model('Service', serviceSchema);
