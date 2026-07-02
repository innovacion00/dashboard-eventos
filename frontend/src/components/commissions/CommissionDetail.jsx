import { useState, useEffect } from 'react';
import { eventCostsApi } from '../../lib/api/event-costs.api.js';
import { commissionsApi } from '../../lib/api/commissions.api.js';
import { formatCurrency } from '../../lib/utils/format.js';
import { Alert } from '../ui/Alert.jsx';

const CATEGORY_LABEL = {
  AB: 'A&B', AV: 'Audiovisual', SALON: 'Salón', PERSONAL: 'Personal',
  PROVEEDOR: 'Proveedor', OTRO: 'Otro', OTROS: 'Otros', EXTERNO: 'Externo',
};

const STATUS_LABEL = { CALCULADA: 'Calculada', APROBADA: 'Aprobada', PAGADA: 'Pagada', ANULADA: 'Anulada' };
const STATUS_VARIANT = { CALCULADA: 'neutral', APROBADA: 'warning', PAGADA: 'success', ANULADA: 'danger' };
const NEXT_STATUS = { CALCULADA: 'APROBADA', APROBADA: 'PAGADA' };
const COMMISSION_RATE = 0.03;

export function CommissionDetail({ commission, onClose, onReload }) {
  const [breakdown, setBreakdown] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    const eventId = commission.event?.id;
    if (!eventId) { setLoading(false); return; }
    setLoading(true);
    setBreakdown(null);
    eventCostsApi.getProfitBreakdown(eventId)
      .then(res => setBreakdown(res.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [commission.id]);

  const handleAdvance = async (newStatus) => {
    setAdvancing(true);
    setError('');
    try {
      await commissionsApi.changeStatus(commission.id, newStatus);
      onReload();
    } catch (e) {
      setError(e.message);
      setAdvancing(false);
    }
  };

  const rows = (breakdown?.categories || []).filter((cat) => cat.category !== 'EXTERNO');
  const totalCommission = rows.reduce((sum, cat) => sum + cat.profit * COMMISSION_RATE, 0);
  const nextStatus = NEXT_STATUS[commission.status];

  return (
    <div style={{
      marginTop: 'var(--space-4)',
      padding: 'var(--space-5)',
      background: 'var(--color-bg)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
    }}>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-gold-dark)', fontSize: 'var(--text-base)' }}>
            {commission.number}
          </span>
          <span className={`badge badge-${STATUS_VARIANT[commission.status]}`}>
            {STATUS_LABEL[commission.status]}
          </span>
          {nextStatus && !advancing && commission.status !== 'ANULADA' && (
            <button className="link-btn" style={{ fontSize: 'var(--text-sm)' }} onClick={() => handleAdvance(nextStatus)}>
              → {STATUS_LABEL[nextStatus]}
            </button>
          )}
          {advancing && <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Guardando...</span>}
        </div>
        <button className="link-btn" style={{ fontSize: 'var(--text-sm)', flexShrink: 0 }} onClick={onClose}>
          ✕ Cerrar
        </button>
      </div>

      {/* Meta info */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 'var(--space-5)',
        marginBottom: 'var(--space-5)',
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-muted)',
        padding: 'var(--space-3)',
        background: 'var(--color-gray-1)',
        borderRadius: 'var(--radius-sm)',
      }}>
        <span>Evento: <strong style={{ color: 'var(--color-text)' }}>{commission.event?.number || '—'}</strong></span>
        <span>Beneficiario: <strong style={{ color: 'var(--color-text)' }}>{commission.beneficiaryName || commission.beneficiary?.name || '—'}</strong></span>
        <span>Tipo: <strong style={{ color: 'var(--color-text)' }}>{commission.beneficiaryType?.replace(/_/g, ' ') || '—'}</strong></span>
        <span>Tasa comisión: <strong style={{ color: 'var(--color-gold-dark)' }}>3%</strong></span>
      </div>

      {/* Breakdown table */}
      {loading ? (
        <p className="page-loading">Cargando desglose de utilidades...</p>
      ) : rows.length === 0 ? (
        <p className="text-muted">
          No hay datos de costos/utilidades para este evento.
          El evento debe tener una cotización aprobada para calcular la comisión.
        </p>
      ) : (
        <div className="table-wrapper">
          <table className="table" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '20%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '20%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Venta antes de imp.</th>
                <th style={{ color: 'var(--color-danger)' }}>Costo</th>
                <th style={{ color: 'var(--color-success)' }}>Utilidad</th>
                <th style={{ color: 'var(--color-gold-dark)' }}>Comisión (3%)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((cat) => (
                <tr key={cat.category}>
                  <td>
                    <span className="badge badge-neutral">{CATEGORY_LABEL[cat.category] || cat.category}</span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{formatCurrency(cat.revenue)}</td>
                  <td style={{ color: 'var(--color-danger)', fontWeight: 500 }}>{formatCurrency(cat.cost)}</td>
                  <td style={{ color: 'var(--color-success)', fontWeight: 500 }}>{formatCurrency(cat.profit)}</td>
                  <td style={{ color: 'var(--color-gold-dark)', fontWeight: 600 }}>
                    {formatCurrency(cat.profit * COMMISSION_RATE)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: 'var(--color-surface)', fontWeight: 700 }}>
                <td>Total</td>
                <td>{formatCurrency(breakdown.totals.revenue)}</td>
                <td style={{ color: 'var(--color-danger)' }}>{formatCurrency(breakdown.totals.cost)}</td>
                <td style={{ color: 'var(--color-success)' }}>{formatCurrency(breakdown.totals.profit)}</td>
                <td style={{ color: 'var(--color-gold-dark)', fontSize: 'var(--text-base)' }}>
                  {formatCurrency(totalCommission)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
