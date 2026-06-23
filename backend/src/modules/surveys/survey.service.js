import { surveyRepository } from './survey.repository.js';
import { NotFoundError } from '../../core/errors/NotFoundError.js';
import { AppError } from '../../core/errors/AppError.js';
import { audit } from '../audit/audit.service.js';
import { notifyRoles } from '../notifications/notification.service.js';
import { ROLES } from '../../core/constants/roles.js';

const VALID_TRANSITIONS = {
  BORRADOR: ['ACTIVA'],
  ACTIVA: ['CERRADA'],
  CERRADA: [],
};

const DEFAULT_NPS_QUESTION = {
  order: 0,
  type: 'NPS',
  text: 'En una escala del 0 al 10, ¿qué tan probable es que nos recomiende?',
  required: true,
};

export const surveyService = {
  async listSurveys(query) {
    return surveyRepository.findAll(query);
  },

  async getSurveyById(id) {
    const survey = await surveyRepository.findById(id);
    if (!survey || !survey.active) throw new NotFoundError('Encuesta no encontrada');
    return survey;
  },

  async createSurvey(data, requestingUser, req) {
    const questions = data.questions || [];
    const hasNps = questions.some((q) => q.type === 'NPS');
    if (!hasNps) {
      questions.unshift({ ...DEFAULT_NPS_QUESTION });
    }

    // Re-order questions sequentially
    questions.forEach((q, idx) => {
      q.order = idx;
    });

    const survey = await surveyRepository.create({
      ...data,
      questions,
      createdBy: requestingUser.id,
    });

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'surveys',
      action: 'CREATE',
      entityId: survey._id,
      after: { title: survey.title, eventId: survey.eventId },
      req,
    });

    return survey;
  },

  async updateSurvey(id, data, requestingUser, req) {
    const survey = await surveyRepository.findById(id);
    if (!survey || !survey.active) throw new NotFoundError('Encuesta no encontrada');
    if (survey.status !== 'BORRADOR') {
      throw new AppError('Solo se pueden editar encuestas en borrador', 409, 'INVALID_STATE');
    }

    const before = { title: survey.title, status: survey.status };
    const updated = await surveyRepository.update(id, data);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'surveys',
      action: 'UPDATE',
      entityId: id,
      before,
      after: { title: updated.title },
      req,
    });

    return updated;
  },

  async changeStatus(id, newStatus, requestingUser, req) {
    const survey = await surveyRepository.findById(id);
    if (!survey || !survey.active) throw new NotFoundError('Encuesta no encontrada');

    const allowed = VALID_TRANSITIONS[survey.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new AppError(
        `No se puede cambiar de ${survey.status} a ${newStatus}`,
        409,
        'INVALID_TRANSITION'
      );
    }

    const before = { status: survey.status };
    await surveyRepository.changeStatus(id, newStatus);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'surveys',
      action: 'UPDATE',
      entityId: id,
      before,
      after: { status: newStatus },
      req,
    });

    return surveyRepository.findById(id);
  },

  async deleteSurvey(id, requestingUser, req) {
    const survey = await surveyRepository.findById(id);
    if (!survey || !survey.active) throw new NotFoundError('Encuesta no encontrada');
    if (survey.status !== 'BORRADOR') {
      throw new AppError('Solo se pueden eliminar encuestas en borrador', 409, 'INVALID_STATE');
    }

    await surveyRepository.softDelete(id);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'surveys',
      action: 'DELETE',
      entityId: id,
      before: { title: survey.title, status: survey.status },
      req,
    });
  },

  async getSurveyByToken(token) {
    const survey = await surveyRepository.findByToken(token);
    if (!survey) throw new NotFoundError('Encuesta no encontrada');
    if (survey.status !== 'ACTIVA') {
      throw new AppError('Esta encuesta no está disponible', 410, 'SURVEY_UNAVAILABLE');
    }
    return survey;
  },

  async submitResponse(token, responseData) {
    const survey = await surveyRepository.findByToken(token);
    if (!survey) throw new NotFoundError('Encuesta no encontrada');
    if (survey.status !== 'ACTIVA') {
      throw new AppError('Esta encuesta no está disponible', 410, 'SURVEY_UNAVAILABLE');
    }

    // Validate required questions are answered
    const answeredIds = new Set(responseData.answers.map((a) => a.questionId));
    const missingRequired = survey.questions.filter(
      (q) => q.required && !answeredIds.has(q._id.toString())
    );
    if (missingRequired.length > 0) {
      const missingTexts = missingRequired.map((q) => q.text).join(', ');
      throw new AppError(
        `Faltan respuestas obligatorias: ${missingTexts}`,
        400,
        'MISSING_REQUIRED_ANSWERS'
      );
    }

    // Validate NPS answers are integers 0-10
    const npsQuestionIds = new Set(
      survey.questions.filter((q) => q.type === 'NPS').map((q) => q._id.toString())
    );
    for (const answer of responseData.answers) {
      if (npsQuestionIds.has(answer.questionId)) {
        const val = Number(answer.value);
        if (!Number.isInteger(val) || val < 0 || val > 10) {
          throw new AppError(
            'La respuesta NPS debe ser un número entero entre 0 y 10',
            400,
            'INVALID_NPS_VALUE'
          );
        }
        answer.value = val;
      }
    }

    const surveyResponse = await surveyRepository.createResponse({
      surveyId: survey._id,
      eventId: survey.eventId,
      respondentName: responseData.respondentName,
      respondentEmail: responseData.respondentEmail,
      answers: responseData.answers,
    });

    await notifyRoles({
      roles: [ROLES.CALIDAD, ROLES.DIRECCION_GENERAL],
      type: 'SURVEY_RESPONSE',
      title: 'Nueva respuesta de encuesta',
      message: `Se recibió una nueva respuesta para la encuesta "${survey.title}"`,
      actionUrl: `/surveys/${survey._id}/responses`,
    });

    return surveyResponse;
  },

  async getResponses(surveyId, query) {
    const survey = await surveyRepository.findById(surveyId);
    if (!survey || !survey.active) throw new NotFoundError('Encuesta no encontrada');
    return surveyRepository.findResponses(surveyId, query);
  },

  async calculateNps(surveyId) {
    const survey = await surveyRepository.findById(surveyId);
    if (!survey || !survey.active) throw new NotFoundError('Encuesta no encontrada');

    const npsQuestion = survey.questions.find((q) => q.type === 'NPS');
    if (!npsQuestion) {
      return {
        nps: 0,
        totalResponses: 0,
        promoters: 0,
        passives: 0,
        detractors: 0,
        promoterPct: 0,
        passivePct: 0,
        detractorPct: 0,
      };
    }

    const npsValues = await surveyRepository.getAllNpsAnswers(surveyId, npsQuestion._id);
    const totalResponses = npsValues.length;

    if (totalResponses === 0) {
      return {
        nps: 0,
        totalResponses: 0,
        promoters: 0,
        passives: 0,
        detractors: 0,
        promoterPct: 0,
        passivePct: 0,
        detractorPct: 0,
      };
    }

    let promoters = 0;
    let passives = 0;
    let detractors = 0;

    for (const val of npsValues) {
      const score = Number(val);
      if (score >= 9) promoters++;
      else if (score >= 7) passives++;
      else detractors++;
    }

    const promoterPct = Math.round((promoters / totalResponses) * 100);
    const detractorPct = Math.round((detractors / totalResponses) * 100);
    const passivePct = Math.round((passives / totalResponses) * 100);
    const nps = Math.round((promoters / totalResponses) * 100 - (detractors / totalResponses) * 100);

    return {
      nps,
      totalResponses,
      promoters,
      passives,
      detractors,
      promoterPct,
      passivePct,
      detractorPct,
    };
  },
};
