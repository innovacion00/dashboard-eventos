import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    revenueTarget: { type: Number, required: true, min: 0 },
    eventCountTarget: { type: Number, min: 0, default: 0 },
    averageTicketTarget: { type: Number, min: 0 },
    marginTarget: { type: Number, min: 0, max: 100 },
    presaleThreshold: { type: Number, default: 60 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, collection: 'goals' }
);

goalSchema.index({ year: 1, month: 1 }, { unique: true });

export const Goal = mongoose.model('Goal', goalSchema);
