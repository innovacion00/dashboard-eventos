import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    position: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true },
    notes: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'contacts' }
);

export const Contact = mongoose.model('Contact', contactSchema);
