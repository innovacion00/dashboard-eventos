import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: 'text' },
    taxId: { type: String, trim: true, sparse: true },
    segment: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ['PROSPECTO', 'CLIENTE_ACTIVO', 'CLIENTE_INACTIVO', 'ALIADO', 'AGENCIA', 'GUBERNAMENTAL'],
      default: 'PROSPECTO',
    },
    origin: { type: String },
    estimatedPotential: { type: Number, min: 0 },
    location: {
      country: { type: String },
      city: { type: String },
      address: { type: String },
    },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    lastContactAt: { type: Date },
    nextActionAt: { type: Date },
    nextActionDescription: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'companies' }
);

companySchema.index({ name: 'text' });
companySchema.index({ segment: 1 });
companySchema.index({ status: 1 });
companySchema.index({ ownerId: 1 });

export const Company = mongoose.model('Company', companySchema);
