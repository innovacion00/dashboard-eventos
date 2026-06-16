import { useState, useEffect } from 'react';
import { commissionsApi } from '../../lib/api/commissions.api.js';
import { Alert } from '../ui/Alert.jsx';
import { formatCurrency, formatDate } from '../../lib/utils/format.js';

const STATUS_LABEL = { CALCULADA: 'Calculada', APROBADA: 'Aprobada', PAGADA: 'Pagada', ANULADA: 'Anulada' };
const STATUS_VARIANT = { CALCULADA: 'neutral', APROBADA: 'warning', PAGADA: 'success', ANULADA: 'danger' };
const STATUSES = Object.keys(STATUS_LABEL);

const NEXT = { CALCULADA: 'APROBADA', APROBADA: 'PAGADA' };

export function CommissionList() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await commissionsApi.list({ status: statusFilter || undefined });
      setItems(res.data || []);
      setMeta(res.meta);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleAdvance = async (id, newStatus) => {
    try {
      await commissionsApi.changeStatus(id, newStatus);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Comisiones</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>Nueva comisión</button>
      </div>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {showForm && (
        <CommissionForm onSaved={() => { setShowForm(false); load(); }} onCancel={() => setShowForm(false)} />
      )}

      <div className="page-filters">
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Todos los estados</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="text-muted">Cargando...</p>
      ) : items.length === 0 ? (
        <p className="text-muted">No hay comisiones registradas.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Número</th><th>Evento</th><th>Beneficiario</th><th>Tipo</th>
              <th>Base</th><th>Tasa</th><th>Comisión</th><th>Estado</th><th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.number}</strong></td>
                <td>{c.event?.number || '—'}</td>
                <td>{c.beneficiary?.name || c.beneficiaryName || '—'}</td>
                <td>{c.beneficiaryType?.replace('_', ' ')}</td>
                <td>{formatCurrency(c.baseAmount)}</td>
                <td>{(c.rate * 100).toFixed(1)}%</td>
                <td><strong>{formatCurrency(c.amount)}</strong></td>
                <td>
                  <span className={`badge badge-${STATUS_VARIANT[c.status]}`}>{STATUS_LABEL[c.status]}</span>
                </td>
                <td>
                  {NEXT[c.status] && (
                    <button className="link-btn" onClick={() => handleAdvance(c.id, NEXT[c.status])}>
                      → {STATUS_LABEL[NEXT[c.status]]}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {meta && (
        <p className="text-muted" style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-3)' }}>
          {meta.total} registro(s)
        </p>
      )}
    </div>
  );
}

const BENEFICIARY_TYPES = ['EJECUTIVO_COMERCIAL', 'FREELANCE', 'ALIADO', 'AGENCIA', 'OTRO'];

function CommissionForm({ onSaved, onCancel }) {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    eventId: '', beneficiaryName: '', beneficiaryType: 'EJECUTIVO_COMERCIAL',
    baseAmount: '', rate: '0.05', notes: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    import('../../lib/api/events.api.js').then(({ eventsApi }) =>
      eventsApi.list({ limit: 200 }).then((r) => setEvents(r.data || []))
    ).catch(() => {});
  }, []);

  const computed = Math.round((parseFloat(form.baseAmount) || 0) * (parseFloat(form.rate) || 0) * 100) / 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await commissionsApi.create({
        eventId: form.eventId,
        beneficiaryName: form.beneficiaryName,
        beneficiaryType: form.beneficiaryType,
        baseAmount: parseFloat(form.baseAmount),
        rate: parseFloat(form.rate),
        notes: form.notes || undefined,
      });
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
      <h3 style={{ margin: '0 0 var(--space-4)' }}>Nueva comisión</h3>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      <form onSubmit={handleSubmit}>
        <div className="form-grid-2">
          <div className="input-field">
            <label className="input-label">Evento <span className="input-required">*</span></label>
            <select className="select-field" value={form.eventId} onChange={(e) => setForm((f) => ({ ...f, eventId: e.target.value }))} required>
              <option value="">Seleccionar evento</option>
              {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.number} — {ev.name}</option>)}
            </select>
          </div>
          <div className="input-field">
            <label className="input-label">Tipo de beneficiario</label>
            <select className="select-field" value={form.beneficiaryType} onChange={(e) => setForm((f) => ({ ...f, beneficiaryType: e.target.value }))}>
              {BENEFICIARY_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="input-field">
            <label className="input-label">Nombre beneficiario</label>
            <input className="input" type="text" value={form.beneficiaryName}
              onChange={(e) => setForm((f) => ({ ...f, beneficiaryName: e.target.value }))} />
          </div>
          <div className="input-field">
            <label className="input-label">Monto base <span className="input-required">*</span></label>
            <input className="input" type="number" min="0" step="0.01" value={form.baseAmount}
              onChange={(e) => setForm((f) => ({ ...f, baseAmount: e.target.value }))} required />
          </div>
          <div className="input-field">
            <label className="input-label">Tasa (%) <span className="input-required">*</span></label>
            <input className="input" type="number" min="0" max="100" step="0.1"
              value={(parseFloat(form.rate) * 100).toFixed(1)}
              onChange={(e) => setForm((f) => ({ ...f, rate: String(parseFloat(e.target.value) / 100) }))} required />
          </div>
          <div className="input-field" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <p style={{ margin: 0, fontWeight: 'var(--font-bold)', color: 'var(--color-gold-dark)' }}>
              Comisión calculada: {formatCurrency(computed)}
            </p>
          </div>
        </div>
        <div className="input-field">
          <label className="input-label">Notas</label>
          <textarea className="input" rows={2} value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Crear'}</button>
        </div>
      </form>
    </div>
  );
}
