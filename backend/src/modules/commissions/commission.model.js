import mongoose from 'mongoose';

export const COMMISSION_STATUSES = ['CALCULADA', 'APROBADA', 'PAGADA', 'ANULADA'];
export const BENEFICIARY_TYPES = ['EJECUTIVO_COMERCIAL', 'FREELANCE', 'ALIADO', 'AGENCIA', 'OTRO'];

const commissionSchema = new mongoose.Schema(
  {
    number: { type: String, unique: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    beneficiaryId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    beneficiaryName: { type: String, trim: true },
    beneficiaryType: { type: String, enum: BENEFICIARY_TYPES, required: true },
    baseAmount: { type: Number, required: true, min: 0 },
    rate: { type: Number, required: true, min: 0, max: 1 },
    amount: { type: Number, default: 0 },
    status: { type: String, enum: COMMISSION_STATUSES, default: 'CALCULADA' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    paidAt: { type: Date },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'commissions' }
);

commissionSchema.index({ eventId: 1 });
commissionSchema.index({ beneficiaryId: 1 });
commissionSchema.index({ status: 1 });

commissionSchema.pre('save', async function (next) {
  if (this.isNew && !this.number) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.number = `COM-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  this.amount = Math.round(this.baseAmount * this.rate * 100) / 100;
  next();
});

export const Commission = mongoose.model('Commission', commissionSchema);
