import { useState, useEffect } from 'react';
import { quotesApi } from '../../lib/api/quotes.api.js';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Modal } from '../ui/Modal.jsx';
import { QuoteForm } from './QuoteForm.jsx';
import { formatCurrency, formatDate } from '../../lib/utils/format.js';

const STATUS_LABELS = {
  BORRADOR: 'Borrador',
  EN_REVISION: 'En revisión',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  VENCIDA: 'Vencida',
};

const STATUS_VARIANT = {
  BORRADOR: 'neutral',
  EN_REVISION: 'warning',
  APROBADA: 'success',
  RECHAZADA: 'danger',
  VENCIDA: 'danger',
};

const NEXT_STATUSES = {
  BORRADOR: [{ value: 'EN_REVISION', label: 'Enviar a revisión' }],
  EN_REVISION: [
    { value: 'APROBADA', label: 'Aprobar' },
    { value: 'RECHAZADA', label: 'Rechazar' },
    { value: 'BORRADOR', label: 'Devolver a borrador' },
  ],
  APROBADA: [{ value: 'VENCIDA', label: 'Marcar como vencida' }],
  RECHAZADA: [{ value: 'BORRADOR', label: 'Reabrir como borrador' }],
  VENCIDA: [],
};

const CATEGORY_LABELS = { SALON: 'Salón', AB: 'A&B', AV: 'AV', OTROS: 'Otros', EXTERNO: 'Externo' };

export function QuoteDetail({ id }) {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await quotesApi.getById(id);
      setQuote(res.data);
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
      await quotesApi.changeStatus(id, status);
      const res = await quotesApi.getById(id);
      setQuote(res.data);
      if (status === 'EN_REVISION') {
        await quotesApi.downloadPdf(id, res.data.number + '.pdf');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading('');
    }
  };

  if (loading) return <p className="page-loading">Cargando cotización...</p>;
  if (!quote) return <p className="page-loading">Cotización no encontrada.</p>;

  // Calcular desde ítems para garantizar valores correctos en cotizaciones previas
  const icoBase   = (quote.items || []).filter(i => i.category === 'AB').reduce((s, i) => s + (i.total || 0), 0);
  const ivaBase   = (quote.subtotal || 0) - icoBase;
  const ivaAmount = quote.ivaAmount > 0 ? quote.ivaAmount : Math.round(ivaBase * (quote.taxRate || 0.19) * 100) / 100;
  const icoAmount = quote.icoAmount > 0 ? quote.icoAmount : Math.round(icoBase * 0.08 * 100) / 100;

  const nextStatuses = NEXT_STATUSES[quote.status] || [];

  return (
    <div className="page-container">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="page-filters">
        <div>
          <strong style={{ fontSize: 'var(--text-base)', color: 'var(--color-gold-dark)' }}>{quote.number}</strong>
          <span className={`badge badge-${STATUS_VARIANT[quote.status] || 'neutral'}`} style={{ marginLeft: 'var(--space-2)' }}>
            {STATUS_LABELS[quote.status]}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginLeft: 'auto' }}>
          {quote.status === 'BORRADOR' && (
            <Button variant="secondary" onClick={() => setShowEdit(true)}>Editar</Button>
          )}
          <Button variant="secondary" onClick={() => quotesApi.downloadPdf(id, quote.number + '.pdf').catch(() => {})}>Descargar PDF</Button>
          {nextStatuses.map(ns => (
            <Button
              key={ns.value}
              variant={ns.value === 'APROBADA' ? 'primary' : 'secondary'}
              onClick={() => handleStatusChange(ns.value)}
              disabled={Boolean(actionLoading)}
            >
              {actionLoading === ns.value ? '...' : ns.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="detail-grid">
        <div className="info-row">
          <span className="info-label">Empresa</span>
          <span className="info-value">{quote.company?.name || '—'}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Fecha del evento</span>
          <span className="info-value">{formatDate(quote.eventDate)}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Tipo de evento</span>
          <span className="info-value">{quote.eventType || '—'}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Salón</span>
          <span className="info-value">{quote.room?.name || '—'}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Asistentes</span>
          <span className="info-value">{quote.attendees || '—'}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Válida hasta</span>
          <span className="info-value">{formatDate(quote.validUntil)}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Creado por</span>
          <span className="info-value">{quote.createdBy?.name || '—'}</span>
        </div>
        {quote.approvedBy && (
          <div className="info-row">
            <span className="info-label">Aprobado por</span>
            <span className="info-value">{quote.approvedBy?.name} — {formatDate(quote.approvedAt)}</span>
          </div>
        )}
      </div>

      {/* Tabla de ítems */}
      <div className="panel" style={{ marginTop: 'var(--space-4)' }}>
        <div className="section-header">
          <span className="section-title">Ítems</span>
        </div>
        <div style={{ padding: 'var(--space-4)' }}>
          {quote.items.length === 0 ? (
            <p className="text-muted">Sin ítems.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ background: 'var(--color-gray-1)' }}>
                  <th style={TH}>Descripción</th>
                  <th style={TH}>Categoría</th>
                  <th style={{ ...TH, textAlign: 'right' }}>Cantidad</th>
                  <th style={{ ...TH, textAlign: 'right' }}>Precio unit.</th>
                  <th style={{ ...TH, textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--color-gray-1)' }}>
                    <td style={TD}>{item.description}</td>
                    <td style={TD}>{CATEGORY_LABELS[item.category] || item.category}</td>
                    <td style={{ ...TD, textAlign: 'right' }}>{item.quantity}</td>
                    <td style={{ ...TD, textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
                    <td style={{ ...TD, textAlign: 'right' }}>{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} style={{ ...TD, textAlign: 'right', fontWeight: 'var(--font-medium)' }}>Subtotal</td>
                  <td style={{ ...TD, textAlign: 'right' }}>{formatCurrency(quote.subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan={4} style={{ ...TD, textAlign: 'right', fontWeight: 'var(--font-medium)' }}>IVA ({Math.round((quote.taxRate || 0.19) * 100)}%)</td>
                  <td style={{ ...TD, textAlign: 'right' }}>{formatCurrency(ivaAmount)}</td>
                </tr>
                <tr>
                  <td colSpan={4} style={{ ...TD, textAlign: 'right', fontWeight: 'var(--font-medium)' }}>ICO — A&B (8%)</td>
                  <td style={{ ...TD, textAlign: 'right' }}>{formatCurrency(icoAmount)}</td>
                </tr>
                <tr style={{ background: 'var(--color-gold-subtle)' }}>
                  <td colSpan={4} style={{ ...TD, textAlign: 'right', fontWeight: 'var(--font-bold)', fontSize: 'var(--text-base)' }}>TOTAL</td>
                  <td style={{ ...TD, textAlign: 'right', fontWeight: 'var(--font-bold)', fontSize: 'var(--text-base)' }}>{formatCurrency(quote.total)}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>

      {quote.notes && (
        <div className="panel" style={{ padding: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
          <p className="input-label" style={{ marginBottom: 'var(--space-2)' }}>Notas para el cliente</p>
          <p style={{ fontSize: 'var(--text-sm)', whiteSpace: 'pre-wrap' }}>{quote.notes}</p>
        </div>
      )}

      <Modal open={showEdit} title="Editar cotización" size="lg" onClose={() => setShowEdit(false)}>
        <QuoteForm
          quoteId={id}
          onSaved={() => { setShowEdit(false); load(); }}
          onCancel={() => setShowEdit(false)}
        />
      </Modal>
    </div>
  );
}

const TH = { padding: '8px 12px', textAlign: 'left', fontWeight: 'var(--font-semibold)', borderBottom: '1px solid var(--color-border)' };
const TD = { padding: '8px 12px', verticalAlign: 'middle' };
