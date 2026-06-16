import mongoose from 'mongoose';

const catalogSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, index: true },
    code: { type: String, required: true },
    label: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'catalogs' }
);

catalogSchema.index({ type: 1, code: 1 }, { unique: true });

export const Catalog = mongoose.model('Catalog', catalogSchema);
