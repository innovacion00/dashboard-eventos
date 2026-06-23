import { useState, useEffect } from 'react';
import { eventsApi } from '../../lib/api/events.api.js';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Modal } from '../ui/Modal.jsx';
import { EventForm } from './EventForm.jsx';
import { QuoteForm } from '../quotes/QuoteForm.jsx';
import { BeoPanel } from '../beos/BeoPanel.jsx';
import { EventCostsPanel } from '../event-costs/EventCostsPanel.jsx';
import { formatDate, formatCurrency } from '../../lib/utils/format.js';

const STATUS_LABELS = {
  CONFIRMADO: 'Confirmado',
  EN_PRODUCCION: 'En producción',
  REALIZADO: 'Realizado',
  CANCELADO: 'Cancelado',
  POSPUESTO: 'Pospuesto',
};

const STATUS_VARIANT = {
  CONFIRMADO: 'success',
  EN_PRODUCCION: 'warning',
  REALIZADO: 'neutral',
  CANCELADO: 'danger',
  POSPUESTO: 'warning',
};

const SETUP_LABELS = { AUDITORIO: 'Auditorio', ESCUELA: 'Escuela', U_SHAPE: 'U-Shape', COCTEL: 'Coctel', BANQUETE: 'Banquete' };

const NEXT_STATUSES = {
  CONFIRMADO: [{ value: 'EN_PRODUCCION', label: 'Iniciar producción' }, { value: 'POSPUESTO', label: 'Posponer' }, { value: 'CANCELADO', label: 'Cancelar' }],
  EN_PRODUCCION: [{ value: 'REALIZADO', label: 'Marcar como realizado' }, { value: 'POSPUESTO', label: 'Posponer' }, { value: 'CANCELADO', label: 'Cancelar' }],
  POSPUESTO: [{ value: 'CONFIRMADO', label: 'Reconfirmar' }, { value: 'CANCELADO', label: 'Cancelar' }],
  REALIZADO: [],
  CANCELADO: [],
};

export function EventDetail({ id }) {
  const [event, setEvent] = useState(null);
  const [tab, setTab] = useState('info');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [showQuoteEdit, setShowQuoteEdit] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await eventsApi.getById(id);
      setEvent(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleStatusChange = async (status) => {
    setActionLoading(status);
    try {
      await eventsApi.changeStatus(id, status);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading('');
    }
  };

  if (loading) return <p className="page-loading">Cargando evento...</p>;
  if (!event) return <p className="page-loading">Evento no encontrado.</p>;

  const nextStatuses = NEXT_STATUSES[event.status] || [];

  return (
    <div className="page-container">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="page-filters">
        <div>
          <strong style={{ fontSize: 'var(--text-base)', color: 'var(--color-gold-dark)' }}>{event.number} — {event.name}</strong>
          <span className={`badge badge-${STATUS_VARIANT[event.status] || 'neutral'}`} style={{ marginLeft: 'var(--space-2)' }}>
            {STATUS_LABELS[event.status]}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginLeft: 'auto' }}>
          {event.status !== 'CANCELADO' && event.status !== 'REALIZADO' && (
            <>
              <Button variant="secondary" onClick={() => setShowEdit(true)}>Editar evento</Button>
              {event.quote && (
                <Button variant="secondary" onClick={() => setShowQuoteEdit(true)}>Editar cotización</Button>
              )}
            </>
          )}
          {nextStatuses.map(ns => (
            <Button
              key={ns.value}
              variant={ns.value === 'CANCELADO' ? 'secondary' : 'primary'}
              onClick={() => handleStatusChange(ns.value)}
              disabled={Boolean(actionLoading)}
            >
              {actionLoading === ns.value ? '...' : ns.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 'var(--space-4)' }}>
        {[
          { key: 'info', label: 'Información' },
          { key: 'beo', label: 'BEO (Orden Operativa)' },
          { key: 'costos', label: 'Costos / Utilidad' },
        ].map(({ key, label }) => (
          <button key={key} className={`tab-btn ${tab === key ? 'tab-btn--active' : ''}`} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <>
          <div className="detail-grid">
            <div className="info-row">
              <span className="info-label">Empresa</span>
              <span className="info-value">{event.company?.name || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Fecha del evento</span>
              <span className="info-value">{formatDate(event.eventDate)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Tipo de evento</span>
              <span className="info-value">{event.eventType || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Salón</span>
              <span className="info-value">{event.room?.name || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Montaje</span>
              <span className="info-value">{SETUP_LABELS[event.setupType] || event.setupType || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Asistentes</span>
              <span className="info-value">{event.attendees || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Horario</span>
              <span className="info-value">
                {event.startTime && event.endTime ? `${event.startTime} — ${event.endTime}` : event.startTime || '—'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Valor total</span>
              <span className="info-value">{formatCurrency(event.totalValue)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Responsable</span>
              <span className="info-value">{event.owner?.name || '—'}</span>
            </div>
            {event.opportunityId && (
              <div className="info-row">
                <span className="info-label">Oportunidad origen</span>
                <span className="info-value">
                  <a href={`/pipeline`} style={{ color: 'var(--color-primary)' }}>Ver pipeline</a>
                </span>
              </div>
            )}
            {event.quote && (
              <div className="info-row">
                <span className="info-label">Cotización</span>
                <span className="info-value">
                  <a href={`/cotizaciones/${event.quote.id || event.quote._id}`}>{event.quote.number}</a>
                </span>
              </div>
            )}
          </div>
          {event.notes && (
            <div className="panel" style={{ padding: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
              <p className="input-label" style={{ marginBottom: 'var(--space-2)' }}>Notas</p>
              <p style={{ fontSize: 'var(--text-sm)', whiteSpace: 'pre-wrap' }}>{event.notes}</p>
            </div>
          )}
        </>
      )}

      {tab === 'beo' && <BeoPanel eventId={id} />}

      {tab === 'costos' && <EventCostsPanel eventId={id} revenue={event.totalValue || 0} />}

      <Modal open={showEdit} title="Editar evento" onClose={() => setShowEdit(false)}>
        <EventForm
          eventId={id}
          onSaved={() => { setShowEdit(false); load(); }}
          onCancel={() => setShowEdit(false)}
        />
      </Modal>

      {event.quote && showQuoteEdit && (
        <Modal open={showQuoteEdit} title="Editar cotización" size="lg" onClose={() => setShowQuoteEdit(false)}>
          <QuoteForm
            quoteId={event.quote.id || event.quote._id}
            onSaved={() => { setShowQuoteEdit(false); load(); }}
            onCancel={() => setShowQuoteEdit(false)}
          />
        </Modal>
      )}
    </div>
  );
}
