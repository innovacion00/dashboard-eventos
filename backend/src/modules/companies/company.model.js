import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: 'text' },
    segment: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ['PROSPECTO', 'CLIENTE_ACTIVO', 'CLIENTE_INACTIVO', 'ALIADO', 'AGENCIA', 'GUBERNAMENTAL'],
      default: 'PROSPECTO',
    },
    contactName: { type: String, trim: true },
    contactPosition: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
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
