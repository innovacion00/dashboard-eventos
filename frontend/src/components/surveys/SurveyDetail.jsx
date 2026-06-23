import { useState, useEffect, useCallback } from 'react';
import { surveysApi } from '../../lib/api/surveys.api.js';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Modal } from '../ui/Modal.jsx';
import { Table } from '../ui/Table.jsx';
import { SurveyForm } from './SurveyForm.jsx';
import { formatDate, formatDateTime } from '../../lib/utils/format.js';
import './SurveyDetail.css';

const STATUS_LABELS = {
  BORRADOR: 'Borrador',
  ACTIVA: 'Activa',
  CERRADA: 'Cerrada',
};

const STATUS_VARIANT = {
  BORRADOR: 'neutral',
  ACTIVA: 'success',
  CERRADA: 'warning',
};

const TYPE_LABELS = {
  NPS: 'NPS',
  TEXT: 'Texto abierto',
  RATING: 'Calificacion (1-5)',
  SINGLE_CHOICE: 'Seleccion unica',
  MULTIPLE_CHOICE: 'Seleccion multiple',
};

export function SurveyDetail({ id }) {
  const [survey, setSurvey] = useState(null);
  const [tab, setTab] = useState('info');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Responses tab state
  const [responses, setResponses] = useState([]);
  const [responsesMeta, setResponsesMeta] = useState(null);
  const [responsesPage, setResponsesPage] = useState(1);
  const [responsesLoading, setResponsesLoading] = useState(false);

  // NPS tab state
  const [nps, setNps] = useState(null);
  const [npsLoading, setNpsLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await surveysApi.getById(id);
      setSurvey(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadResponses = useCallback(async () => {
    try {
      setResponsesLoading(true);
      const res = await surveysApi.getResponses(id, { page: responsesPage, limit: 20 });
      setResponses(res.data || []);
      setResponsesMeta(res.meta || null);
    } catch (e) {
      setError(e.message);
    } finally {
      setResponsesLoading(false);
    }
  }, [id, responsesPage]);

  const loadNps = useCallback(async () => {
    try {
      setNpsLoading(true);
      const res = await surveysApi.getNps(id);
      setNps(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setNpsLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (tab === 'responses') loadResponses();
  }, [tab, loadResponses]);

  useEffect(() => {
    if (tab === 'nps') loadNps();
  }, [tab, loadNps]);

  const handleStatusChange = async (newStatus) => {
    setActionLoading(true);
    try {
      await surveysApi.changeStatus(id, newStatus);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!survey?.publicUrl) return;
    const fullUrl = window.location.origin + survey.publicUrl;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  if (loading) return <p className="page-loading">Cargando encuesta...</p>;
  if (!survey) return <p className="page-loading">Encuesta no encontrada.</p>;

  const publicUrl = survey.publicUrl
    ? window.location.origin + survey.publicUrl
    : null;

  return (
    <div className="page-container">
      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

      {/* Header */}
      <div className="page-filters">
        <div>
          <strong style={{ fontSize: 'var(--text-base)', color: 'var(--color-gold-dark)' }}>
            {survey.title}
          </strong>
          <span
            className={`badge badge-${STATUS_VARIANT[survey.status] || 'neutral'}`}
            style={{ marginLeft: 'var(--space-2)' }}
          >
            {STATUS_LABELS[survey.status] || survey.status}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginLeft: 'auto' }}>
          {survey.status === 'BORRADOR' && (
            <>
              <Button variant="secondary" onClick={() => setShowEdit(true)}>
                Editar
              </Button>
              <Button onClick={() => handleStatusChange('ACTIVA')} disabled={actionLoading}>
                {actionLoading ? '...' : 'Activar encuesta'}
              </Button>
            </>
          )}
          {survey.status === 'ACTIVA' && (
            <Button variant="secondary" onClick={() => handleStatusChange('CERRADA')} disabled={actionLoading}>
              {actionLoading ? '...' : 'Cerrar encuesta'}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-4)' }}>
        {[
          { key: 'info', label: 'Informacion' },
          { key: 'responses', label: 'Respuestas' },
          { key: 'nps', label: 'NPS' },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`tab-btn ${tab === key ? 'tab-btn--active' : ''}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab: Informacion ─────────────────── */}
      {tab === 'info' && (
        <>
          <div className="detail-grid">
            <div className="info-row">
              <span className="info-label">Evento</span>
              <span className="info-value">
                {survey.event?.name || '—'}
                {survey.event?.number ? ` (${survey.event.number})` : ''}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Titulo</span>
              <span className="info-value">{survey.title}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Descripcion</span>
              <span className="info-value">{survey.description || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Estado</span>
              <span className="info-value">
                <span className={`badge badge-${STATUS_VARIANT[survey.status] || 'neutral'}`}>
                  {STATUS_LABELS[survey.status] || survey.status}
                </span>
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Fecha de creacion</span>
              <span className="info-value">{formatDate(survey.createdAt)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Respuestas</span>
              <span className="info-value">{survey.responsesCount ?? 0}</span>
            </div>
          </div>

          {/* Public link */}
          {publicUrl && (
            <div style={{ marginTop: 'var(--space-4)' }}>
              <label className="input-label">Enlace publico</label>
              <div className="public-link">
                <span className="public-link__url">{publicUrl}</span>
                <Button variant="secondary" onClick={handleCopyLink}>
                  {copied ? 'Copiado' : 'Copiar enlace'}
                </Button>
              </div>
            </div>
          )}

          {/* Questions */}
          {survey.questions && survey.questions.length > 0 && (
            <div className="survey-questions">
              <label className="input-label">Preguntas ({survey.questions.length})</label>
              {survey.questions.map((q, i) => (
                <div key={i} className="survey-question-item">
                  <div className="survey-question-item__header">
                    <span className="survey-question-item__order">{q.order || i + 1}</span>
                    <span className="survey-question-item__type">{TYPE_LABELS[q.type] || q.type}</span>
                    {q.required && (
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger)' }}>Obligatoria</span>
                    )}
                  </div>
                  <p className="survey-question-item__text">{q.text}</p>
                  {q.options && q.options.length > 0 && (
                    <p className="survey-question-item__options">
                      Opciones: {q.options.join(' | ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Tab: Respuestas ──────────────────── */}
      {tab === 'responses' && (
        <>
          <Table
            columns={[
              { key: 'respondentName', label: 'Nombre', render: (r) => r.respondentName || 'Anonimo' },
              { key: 'respondentEmail', label: 'Correo', render: (r) => r.respondentEmail || '—' },
              { key: 'submittedAt', label: 'Fecha', render: (r) => formatDateTime(r.submittedAt || r.createdAt) },
              {
                key: 'answers',
                label: 'Resumen',
                render: (r) => {
                  if (!r.answers || r.answers.length === 0) return '—';
                  const npsAnswer = r.answers.find((a) => a.questionType === 'NPS');
                  const summary = npsAnswer ? `NPS: ${npsAnswer.value}` : `${r.answers.length} respuesta(s)`;
                  return <span className="response-answers">{summary}</span>;
                },
              },
            ]}
            rows={responses}
            loading={responsesLoading}
            emptyText="Sin respuestas"
          />

          {responsesMeta && responsesMeta.totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-3)' }}>
              <p className="table-meta" style={{ margin: 0 }}>
                Mostrando {responses.length} de {responsesMeta.total}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Button variant="secondary" onClick={() => setResponsesPage((p) => p - 1)} disabled={responsesPage <= 1 || responsesLoading}>
                  Anterior
                </Button>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  Pagina {responsesPage} de {responsesMeta.totalPages}
                </span>
                <Button variant="secondary" onClick={() => setResponsesPage((p) => p + 1)} disabled={responsesPage >= responsesMeta.totalPages || responsesLoading}>
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Tab: NPS ─────────────────────────── */}
      {tab === 'nps' && (
        <>
          {npsLoading && <p className="page-loading">Cargando datos NPS...</p>}

          {!npsLoading && !nps && (
            <div className="nps-empty">
              <div className="nps-empty__icon">📊</div>
              <p>No hay datos de NPS disponibles</p>
            </div>
          )}

          {!npsLoading && nps && (
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
              {/* NPS Score */}
              <div
                className={`nps-score ${
                  nps.score > 50 ? 'nps-score--positive' : nps.score >= 0 ? 'nps-score--neutral' : 'nps-score--negative'
                }`}
              >
                {nps.score != null ? nps.score : '—'}
              </div>
              <p className="nps-label">Net Promoter Score</p>

              {/* Bar */}
              {nps.total > 0 && (
                <div className="nps-bar">
                  {nps.promoters?.count > 0 && (
                    <div
                      className="nps-bar__segment--promoter"
                      style={{ width: `${(nps.promoters.count / nps.total) * 100}%` }}
                    />
                  )}
                  {nps.passives?.count > 0 && (
                    <div
                      className="nps-bar__segment--passive"
                      style={{ width: `${(nps.passives.count / nps.total) * 100}%` }}
                    />
                  )}
                  {nps.detractors?.count > 0 && (
                    <div
                      className="nps-bar__segment--detractor"
                      style={{ width: `${(nps.detractors.count / nps.total) * 100}%` }}
                    />
                  )}
                </div>
              )}

              {/* Cards */}
              <div className="nps-cards">
                <div className="nps-card">
                  <div className="nps-card__value nps-card__value--promoter">
                    {nps.promoters?.count ?? 0}
                  </div>
                  <div className="nps-card__label">Promotores</div>
                  <div className="nps-card__percent">
                    {nps.promoters?.percentage != null ? `${nps.promoters.percentage}%` : '0%'}
                  </div>
                </div>
                <div className="nps-card">
                  <div className="nps-card__value nps-card__value--passive">
                    {nps.passives?.count ?? 0}
                  </div>
                  <div className="nps-card__label">Pasivos</div>
                  <div className="nps-card__percent">
                    {nps.passives?.percentage != null ? `${nps.passives.percentage}%` : '0%'}
                  </div>
                </div>
                <div className="nps-card">
                  <div className="nps-card__value nps-card__value--detractor">
                    {nps.detractors?.count ?? 0}
                  </div>
                  <div className="nps-card__label">Detractores</div>
                  <div className="nps-card__percent">
                    {nps.detractors?.percentage != null ? `${nps.detractors.percentage}%` : '0%'}
                  </div>
                </div>
              </div>

              <p className="nps-total">
                Total de respuestas: {nps.total ?? 0}
              </p>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      <Modal open={showEdit} title="Editar encuesta" size="lg" onClose={() => setShowEdit(false)}>
        <SurveyForm
          surveyId={id}
          onSaved={() => { setShowEdit(false); load(); }}
          onCancel={() => setShowEdit(false)}
        />
      </Modal>
    </div>
  );
}
