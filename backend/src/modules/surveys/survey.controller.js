import { surveyService } from './survey.service.js';
import { asyncHandler } from '../../core/utils/async-handler.js';
import { successResponse } from '../../core/utils/response.js';

export const surveyController = {
  list: asyncHandler(async (req, res) => {
    const { surveys, meta } = await surveyService.listSurveys(req.query);
    successResponse(res, surveys.map(mapSurvey), 200, meta);
  }),

  getById: asyncHandler(async (req, res) => {
    const survey = await surveyService.getSurveyById(req.params.id);
    successResponse(res, mapSurvey(survey));
  }),

  create: asyncHandler(async (req, res) => {
    const survey = await surveyService.createSurvey(req.body, req.user, req);
    successResponse(res, mapSurvey(survey), 201);
  }),

  update: asyncHandler(async (req, res) => {
    const survey = await surveyService.updateSurvey(req.params.id, req.body, req.user, req);
    successResponse(res, mapSurvey(survey));
  }),

  changeStatus: asyncHandler(async (req, res) => {
    const survey = await surveyService.changeStatus(req.params.id, req.body.status, req.user, req);
    successResponse(res, mapSurvey(survey));
  }),

  remove: asyncHandler(async (req, res) => {
    await surveyService.deleteSurvey(req.params.id, req.user, req);
    successResponse(res, null, 204);
  }),

  getResponses: asyncHandler(async (req, res) => {
    const { responses, meta } = await surveyService.getResponses(req.params.id, req.query);
    successResponse(res, responses.map(mapResponse), 200, meta);
  }),

  getNps: asyncHandler(async (req, res) => {
    const npsData = await surveyService.calculateNps(req.params.id);
    successResponse(res, npsData);
  }),

  getPublicSurvey: asyncHandler(async (req, res) => {
    const survey = await surveyService.getSurveyByToken(req.params.token);
    successResponse(res, {
      title: survey.title,
      description: survey.description,
      questions: survey.questions.map((q) => ({
        id: q._id,
        order: q.order,
        type: q.type,
        text: q.text,
        required: q.required,
        options: q.options,
      })),
    });
  }),

  submitPublicResponse: asyncHandler(async (req, res) => {
    await surveyService.submitResponse(req.params.token, req.body);
    successResponse(res, { message: 'Respuesta registrada exitosamente' }, 201);
  }),
};

function mapSurvey(s) {
  return {
    id: s._id,
    event: s.eventId,
    title: s.title,
    description: s.description,
    token: s.token,
    publicUrl: `/encuesta/${s.token}`,
    questions: (s.questions || []).map((q) => ({
      id: q._id,
      order: q.order,
      type: q.type,
      text: q.text,
      required: q.required,
      options: q.options,
    })),
    status: s.status,
    createdBy: s.createdBy,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

function mapResponse(r) {
  return {
    id: r._id,
    surveyId: r.surveyId,
    respondentName: r.respondentName,
    respondentEmail: r.respondentEmail,
    answers: r.answers,
    submittedAt: r.submittedAt,
  };
}
