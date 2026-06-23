import mongoose from 'mongoose';
import crypto from 'crypto';

export const SURVEY_STATUSES = ['BORRADOR', 'ACTIVA', 'CERRADA'];
export const QUESTION_TYPES = ['NPS', 'TEXT', 'RATING', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE'];

const questionSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  type: { type: String, enum: QUESTION_TYPES, required: true },
  text: { type: String, required: true },
  required: { type: Boolean, default: true },
  options: [{ type: String }],
});

const surveySchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    token: { type: String, unique: true },
    questions: [questionSchema],
    status: { type: String, enum: SURVEY_STATUSES, default: 'BORRADOR' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'surveys' }
);

surveySchema.index({ eventId: 1 });
surveySchema.index({ status: 1 });

surveySchema.pre('save', function (next) {
  if (this.isNew && !this.token) {
    this.token = crypto.randomUUID();
  }
  next();
});

export const Survey = mongoose.model('Survey', surveySchema);
