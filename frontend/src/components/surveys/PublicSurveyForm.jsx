import { useState, useEffect } from 'react';
import { surveysApi } from '../../lib/api/surveys.api.js';
import './PublicSurveyForm.css';

/**
 * Returns background color for an NPS button based on its value (0-10).
 * Gradient: red (0) -> yellow (5) -> green (10).
 */
function npsColor(value) {
  const colors = [
    '#ef4444', '#f06545', '#f18646', '#f2a747', '#eab308',
    '#d4c00a', '#a8c422', '#7cc83a', '#50cc52', '#38b249', '#22c55e',
  ];
  return colors[value] || '#ddd';
}

export function PublicSurveyForm({ token }) {
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Answers indexed by question order/index
  const [answers, setAnswers] = useState({});
  const [respondentName, setRespondentName] = useState('');
  const [respondentEmail, setRespondentEmail] = useState('');

  useEffect(() => {
    if (!token) {
      setErrorState(true);
      setLoading(false);
      return;
    }

    surveysApi.getPublicSurvey(token)
      .then((res) => {
        setSurvey(res.data);
      })
      .catch(() => {
        setErrorState(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const setAnswer = (questionIndex, value) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: value }));
  };

  const handleMultiChoiceToggle = (questionIndex, option) => {
    setAnswers((prev) => {
      const current = prev[questionIndex] || [];
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [questionIndex]: next };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Validate required questions
    if (survey?.questions) {
      for (let i = 0; i < survey.questions.length; i++) {
        const q = survey.questions[i];
        const val = answers[i];
        if (q.required) {
          if (val == null || val === '' || (Array.isArray(val) && val.length === 0)) {
            setSubmitError(`La pregunta "${q.text}" es obligatoria`);
            return;
          }
        }
      }
    }

    setSubmitting(true);
    try {
      const formattedAnswers = survey.questions.map((q, i) => ({
        questionId: q._id || q.id || String(i),
        questionType: q.type,
        value: answers[i] != null ? answers[i] : null,
      }));

      await surveysApi.submitResponse(token, {
        answers: formattedAnswers,
        respondentName: respondentName.trim() || undefined,
        respondentEmail: respondentEmail.trim() || undefined,
      });

      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || 'Error al enviar las respuestas');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="public-survey">
        <div className="public-survey__loading">Cargando encuesta...</div>
      </div>
    );
  }

  // ── Error / not available ──
  if (errorState || !survey) {
    return (
      <div className="public-survey">
        <div className="public-survey__error">
          <div className="public-survey__error-icon">⚠</div>
          <p className="public-survey__error-title">Esta encuesta no esta disponible</p>
          <p className="public-survey__error-message">
            Es posible que el enlace haya expirado o la encuesta ya no se encuentre activa.
          </p>
        </div>
      </div>
    );
  }

  // ── Thank you screen ──
  if (submitted) {
    return (
      <div className="public-survey">
        <div className="thank-you">
          <div className="thank-you__icon">&#10003;</div>
          <h2 className="thank-you__title">¡Gracias por sus comentarios!</h2>
          <p className="thank-you__message">
            Su opinion es muy importante para nosotros. Nos ayuda a mejorar continuamente la calidad de nuestros servicios.
          </p>
        </div>
      </div>
    );
  }

  // ── Survey form ──
  return (
    <div className="public-survey">
      {/* Brand */}
      <div className="public-survey__brand">
        <h1>Hotel Windsor House</h1>
        <p>Encuesta de satisfaccion</p>
      </div>

      {/* Title */}
      <h2 className="public-survey__title">{survey.title}</h2>
      {survey.description && (
        <p className="public-survey__description">{survey.description}</p>
      )}

      <form onSubmit={handleSubmit}>
        {/* Questions */}
        {survey.questions?.map((q, index) => (
          <div key={index} className="public-survey__question">
            <p className="public-survey__question-text">
              {q.text}
              {q.required && <span className="public-survey__question-required"> *</span>}
            </p>

            {/* NPS */}
            {q.type === 'NPS' && (
              <>
                <div className="nps-scale">
                  {Array.from({ length: 11 }, (_, n) => (
                    <button
                      key={n}
                      type="button"
                      className={`nps-scale__btn ${answers[index] === n ? 'nps-scale__btn--selected' : ''}`}
                      style={
                        answers[index] === n
                          ? { background: npsColor(n), borderColor: npsColor(n), color: '#fff' }
                          : { borderColor: npsColor(n), color: npsColor(n) }
                      }
                      onClick={() => setAnswer(index, n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="nps-scale__labels">
                  <span>Poco probable</span>
                  <span>Muy probable</span>
                </div>
              </>
            )}

            {/* TEXT */}
            {q.type === 'TEXT' && (
              <textarea
                className="public-survey__textarea"
                placeholder="Escriba su respuesta..."
                value={answers[index] || ''}
                onChange={(e) => setAnswer(index, e.target.value)}
              />
            )}

            {/* RATING (1-5 stars) */}
            {q.type === 'RATING' && (
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`rating-star ${answers[index] >= star ? 'rating-star--active' : ''}`}
                    onClick={() => setAnswer(index, star)}
                    aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
                  >
                    &#9733;
                  </button>
                ))}
              </div>
            )}

            {/* SINGLE_CHOICE */}
            {q.type === 'SINGLE_CHOICE' && q.options && (
              <div className="public-survey__options">
                {q.options.map((opt, oi) => (
                  <label key={oi} className="public-survey__option">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={opt}
                      checked={answers[index] === opt}
                      onChange={() => setAnswer(index, opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {/* MULTIPLE_CHOICE */}
            {q.type === 'MULTIPLE_CHOICE' && q.options && (
              <div className="public-survey__options">
                {q.options.map((opt, oi) => (
                  <label key={oi} className="public-survey__option">
                    <input
                      type="checkbox"
                      checked={(answers[index] || []).includes(opt)}
                      onChange={() => handleMultiChoiceToggle(index, opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Respondent info */}
        <div className="public-survey__respondent">
          <h3>Informacion de contacto (opcional)</h3>
          <div className="public-survey__respondent-fields">
            <div>
              <label className="public-survey__input-label">Nombre</label>
              <input
                className="public-survey__input"
                type="text"
                value={respondentName}
                onChange={(e) => setRespondentName(e.target.value)}
                placeholder="Su nombre"
              />
            </div>
            <div>
              <label className="public-survey__input-label">Correo electronico</label>
              <input
                className="public-survey__input"
                type="email"
                value={respondentEmail}
                onChange={(e) => setRespondentEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>
        </div>

        {/* Submit error */}
        {submitError && (
          <p className="public-survey__field-error" style={{ textAlign: 'center', marginTop: 16 }}>
            {submitError}
          </p>
        )}

        {/* Submit */}
        <div className="public-survey__submit">
          <button
            type="submit"
            className="public-survey__submit-btn"
            disabled={submitting}
          >
            {submitting ? 'Enviando...' : 'Enviar respuestas'}
          </button>
        </div>
      </form>
    </div>
  );
}
