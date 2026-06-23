import { useState, useEffect } from 'react';
import { surveysApi } from '../../lib/api/surveys.api.js';
import { eventsApi } from '../../lib/api/events.api.js';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';

const QUESTION_TYPES = [
  { value: 'TEXT', label: 'Texto abierto' },
  { value: 'RATING', label: 'Calificacion (1-5)' },
  { value: 'SINGLE_CHOICE', label: 'Seleccion unica' },
  { value: 'MULTIPLE_CHOICE', label: 'Seleccion multiple' },
];

const TYPE_LABELS = {
  NPS: 'NPS',
  TEXT: 'Texto abierto',
  RATING: 'Calificacion (1-5)',
  SINGLE_CHOICE: 'Seleccion unica',
  MULTIPLE_CHOICE: 'Seleccion multiple',
};

const DEFAULT_NPS_QUESTION = {
  type: 'NPS',
  text: 'En una escala del 0 al 10, ¿que tan probable es que nos recomiende?',
  required: true,
  options: [],
};

function makeEmptyQuestion() {
  return {
    type: 'TEXT',
    text: '',
    required: false,
    options: [],
  };
}

export function SurveyForm({ surveyId, onSaved, onCancel }) {
  const isEdit = Boolean(surveyId);

  const [form, setForm] = useState({
    eventId: '',
    title: '',
    description: '',
  });
  const [questions, setQuestions] = useState([{ ...DEFAULT_NPS_QUESTION }]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    eventsApi.list({ limit: 200 }).then((res) => {
      setEvents(res.data || []);
    }).catch(() => {});

    if (isEdit) {
      surveysApi.getById(surveyId).then((res) => {
        const s = res.data;
        setForm({
          eventId: s.event?.id || s.event?._id || s.eventId || '',
          title: s.title || '',
          description: s.description || '',
        });
        if (s.questions && s.questions.length > 0) {
          setQuestions(s.questions.map((q) => ({
            type: q.type,
            text: q.text,
            required: q.required ?? false,
            options: q.options || [],
          })));
        }
      }).catch(() => {});
    }
  }, [surveyId]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const updateQuestion = (index, field, value) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, makeEmptyQuestion()]);
  };

  const removeQuestion = (index) => {
    if (questions[index].type === 'NPS') return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOptionsChange = (index, value) => {
    const opts = value.split(',').map((o) => o.trim()).filter(Boolean);
    updateQuestion(index, 'options', opts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.eventId) {
      setError('Selecciona un evento');
      return;
    }
    if (!form.title || form.title.length < 3) {
      setError('El titulo debe tener al menos 3 caracteres');
      return;
    }

    const hasEmptyText = questions.some((q) => !q.text.trim());
    if (hasEmptyText) {
      setError('Todas las preguntas deben tener texto');
      return;
    }

    const choiceWithoutOptions = questions.some(
      (q) => (q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE') && q.options.length === 0
    );
    if (choiceWithoutOptions) {
      setError('Las preguntas de seleccion deben tener al menos una opcion');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        eventId: form.eventId,
        title: form.title,
        description: form.description || undefined,
        questions: questions.map((q, i) => ({
          order: i + 1,
          type: q.type,
          text: q.text,
          required: q.required,
          options: (q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE') ? q.options : undefined,
        })),
      };

      if (isEdit) {
        await surveysApi.update(surveyId, payload);
      } else {
        await surveysApi.create(payload);
      }
      onSaved?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

      <div className="form-grid-2">
        <div className="input-field">
          <label className="input-label">Evento <span className="input-required">*</span></label>
          <select
            className="input-control"
            value={form.eventId}
            onChange={(e) => set('eventId', e.target.value)}
            required
          >
            <option value="">Seleccionar evento...</option>
            {events.map((ev) => (
              <option key={ev.id || ev._id} value={ev.id || ev._id}>
                {ev.number ? `${ev.number} — ` : ''}{ev.name}
              </option>
            ))}
          </select>
        </div>
        <div className="input-field">
          <label className="input-label">Titulo <span className="input-required">*</span></label>
          <input
            className="input-control"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Ej: Encuesta de satisfaccion del evento"
            required
          />
        </div>
      </div>

      <div className="input-field">
        <label className="input-label">Descripcion</label>
        <textarea
          className="input-control"
          rows={2}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Descripcion breve para los encuestados (opcional)"
        />
      </div>

      {/* Questions builder */}
      <div style={{ marginTop: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
          <label className="input-label" style={{ marginBottom: 0 }}>Preguntas</label>
          <Button type="button" variant="secondary" onClick={addQuestion}>
            + Agregar pregunta
          </Button>
        </div>

        {questions.map((q, index) => {
          const isNps = q.type === 'NPS';
          const showOptions = q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE';

          return (
            <div
              key={index}
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-3)',
                background: isNps ? 'var(--color-gold-subtle)' : 'var(--color-surface)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'var(--color-gold-dark)',
                    color: '#fff',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </span>

                <select
                  className="input-control"
                  value={q.type}
                  onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                  disabled={isNps}
                  style={{ maxWidth: 200 }}
                >
                  {isNps ? (
                    <option value="NPS">NPS</option>
                  ) : (
                    QUESTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))
                  )}
                </select>

                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-sm)', whiteSpace: 'nowrap' }}>
                  <input
                    type="checkbox"
                    checked={q.required}
                    onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                    disabled={isNps}
                  />
                  Obligatoria
                </label>

                {!isNps && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    style={{
                      marginLeft: 'auto',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-danger)',
                      cursor: 'pointer',
                      fontSize: 'var(--text-lg)',
                      padding: 'var(--space-1)',
                      lineHeight: 1,
                    }}
                    title="Eliminar pregunta"
                  >
                    &times;
                  </button>
                )}
              </div>

              <input
                className="input-control"
                value={q.text}
                onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                placeholder="Texto de la pregunta"
                disabled={isNps}
                style={{ marginBottom: showOptions ? 'var(--space-3)' : 0 }}
              />

              {showOptions && (
                <div>
                  <label className="input-label" style={{ fontSize: 'var(--text-xs)', marginBottom: 'var(--space-1)' }}>
                    Opciones (separadas por coma)
                  </label>
                  <input
                    className="input-control"
                    value={q.options.join(', ')}
                    onChange={(e) => handleOptionsChange(index, e.target.value)}
                    placeholder="Opcion 1, Opcion 2, Opcion 3"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear encuesta'}
        </Button>
      </div>
    </form>
  );
}
