import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const surveyResponseSchema = new mongoose.Schema(
  {
    surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    respondentName: { type: String },
    respondentEmail: { type: String },
    answers: [answerSchema],
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: 'survey_responses' }
);

surveyResponseSchema.index({ surveyId: 1 });
surveyResponseSchema.index({ eventId: 1 });

export const SurveyResponse = mongoose.model('SurveyResponse', surveyResponseSchema);
