import { Survey } from './survey.model.js';
import { SurveyResponse } from './survey-response.model.js';
import { getPagination, buildMeta } from '../../core/utils/paginate.js';

export const surveyRepository = {
  async findAll(query) {
    const { page, limit, skip } = getPagination(query);
    const filter = { active: true };
    if (query.eventId) filter.eventId = query.eventId;
    if (query.status) filter.status = query.status;

    const [surveys, total] = await Promise.all([
      Survey.find(filter)
        .populate('eventId', 'name number')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Survey.countDocuments(filter),
    ]);
    return { surveys, meta: buildMeta(page, limit, total) };
  },

  async findById(id) {
    return Survey.findById(id)
      .populate('eventId', 'name number')
      .populate('createdBy', 'name email');
  },

  async findByToken(token) {
    return Survey.findOne({ token, active: true });
  },

  async create(data) {
    const survey = new Survey(data);
    return survey.save();
  },

  async update(id, data) {
    const survey = await Survey.findById(id);
    if (!survey) return null;
    Object.assign(survey, data);
    return survey.save();
  },

  async changeStatus(id, status) {
    return Survey.findByIdAndUpdate(id, { $set: { status } }, { new: true });
  },

  async softDelete(id) {
    return Survey.findByIdAndUpdate(id, { $set: { active: false } }, { new: true });
  },

  async findResponses(surveyId, query) {
    const { page, limit, skip } = getPagination(query);
    const filter = { surveyId };

    const [responses, total] = await Promise.all([
      SurveyResponse.find(filter)
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit),
      SurveyResponse.countDocuments(filter),
    ]);
    return { responses, meta: buildMeta(page, limit, total) };
  },

  async createResponse(data) {
    const response = new SurveyResponse(data);
    return response.save();
  },

  async countResponses(surveyId) {
    return SurveyResponse.countDocuments({ surveyId });
  },

  async getAllNpsAnswers(surveyId, npsQuestionId) {
    const responses = await SurveyResponse.find({ surveyId })
      .select('answers')
      .lean();

    const npsQIdStr = npsQuestionId.toString();
    return responses
      .map((r) => {
        const ans = r.answers.find((a) => a.questionId.toString() === npsQIdStr);
        return ans ? ans.value : null;
      })
      .filter((v) => v !== null && v !== undefined);
  },
};
