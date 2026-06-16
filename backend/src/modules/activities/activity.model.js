import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
    opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity' },
    type: { type: String, required: true },
    date: { type: Date, required: true, index: -1 },
    result: { type: String, required: true },
    nextActionDescription: { type: String },
    nextActionAt: { type: Date },
    completed: { type: Boolean, default: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true, collection: 'activities' }
);

export const Activity = mongoose.model('Activity', activitySchema);
