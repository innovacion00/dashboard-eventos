import mongoose from 'mongoose';

export const COST_CATEGORIES = ['AB', 'AV', 'SALON', 'PERSONAL', 'PROVEEDOR', 'OTRO'];

const eventCostSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    category: { type: String, enum: COST_CATEGORIES, required: true },
    description: { type: String, required: true, trim: true },
    estimatedAmount: { type: Number, default: 0, min: 0 },
    actualAmount: { type: Number, default: 0, min: 0 },
    vendor: { type: String, trim: true },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'event_costs' }
);

eventCostSchema.index({ eventId: 1 });
eventCostSchema.index({ category: 1 });

export const EventCost = mongoose.model('EventCost', eventCostSchema);
