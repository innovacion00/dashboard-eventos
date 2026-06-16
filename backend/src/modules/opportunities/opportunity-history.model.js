import mongoose from 'mongoose';

const opportunityHistorySchema = new mongoose.Schema(
  {
    opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true, index: true },
    fromStage: { type: String },
    toStage: { type: String, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    changedAt: { type: Date, default: Date.now, index: -1 },
  },
  { collection: 'opportunity_history' }
);

export const OpportunityHistory = mongoose.model('OpportunityHistory', opportunityHistorySchema);
