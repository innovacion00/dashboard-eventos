import mongoose from 'mongoose';
import { STAGES, STAGE_CODES } from '../../core/constants/stages.js';

const opportunitySchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    eventType: { type: String },
    segment: { type: String },
    probableRoomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    estimatedEventDate: { type: Date },
    projectionMonth: { type: String, index: true }, // YYYY-MM
    attendees: { type: Number, min: 0 },
    estimatedValue: { type: Number, min: 0, default: 0 },
    stage: { type: String, required: true, enum: STAGE_CODES, default: 'PROSPECTO_INICIAL', index: true },
    probability: { type: Number, min: 0, max: 100 },
    weightedValue: { type: Number, min: 0 },
    nextActionAt: { type: Date, index: true },
    nextActionDescription: { type: String },
    notes: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'opportunities' }
);

// Recalcula probability y weightedValue al cambiar stage o estimatedValue
opportunitySchema.pre('save', function (next) {
  if (this.isModified('stage') || this.isModified('estimatedValue') || this.isNew) {
    const stageData = STAGES[this.stage];
    this.probability = stageData ? stageData.probability : 0;
    this.weightedValue = (this.estimatedValue * this.probability) / 100;
  }
  next();
});

opportunitySchema.index({ projectionMonth: 1, stage: 1 });

export const Opportunity = mongoose.model('Opportunity', opportunitySchema);
