import { useState, useEffect } from 'react';
import { eventCostsApi } from '../../lib/api/event-costs.api.js';
import { Alert } from '../ui/Alert.jsx';
import { formatCurrency } from '../../lib/utils/format.js';

const CATEGORIES = ['AB', 'AV', 'SALON', 'PERSONAL', 'PROVEEDOR', 'OTRO'];
const CATEGORY_LABEL = {
  AB: 'A&B', AV: 'Audiovisual', SALON: 'Salón', PERSONAL: 'Personal', PROVEEDOR: 'Proveedor', OTRO: 'Otro',
};

const EMPTY_FORM = {
  category: 'AB', description: '', estimatedAmount: '', actualAmount: '', vendor: '', notes: '',
};

export function EventCostsPanel({ eventId, revenue = 0 }) {
  const [costs, setCosts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [costsRes, summaryRes] = await Promise.all([
        eventCostsApi.listByEvent(eventId),
        eventCostsApi.getSummary(eventId, revenue),
      ]);
      setCosts(costsRes.data || []);
      setSummary(summaryRes.data);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => { load(); }, [eventId, revenue]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (cost) => {
    setEditing(cost.id);
    setForm({
      category: cost.category,
      description: cost.description,
      estimatedAmount: String(cost.estimatedAmount),
      actualAmount: String(cost.actualAmount),
      vendor: cost.vendor || '',
      notes: cost.notes || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        eventId,
        category: form.category,
        description: form.description,
        estimatedAmount: parseFloat(form.estimatedAmount) || 0,
        actualAmount: parseFloat(form.actualAmount) || 0,
        vendor: form.vendor || undefined,
        notes: form.notes || undefined,
      };
      if (editing) {
        await eventCostsApi.update(editing, payload);
      } else {
        await eventCostsApi.create(payload);
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditing(null);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este costo?')) return;
    try {
      await eventCostsApi.remove(id);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {summary && (
        <div className="profitability-summary">
          <div className="profit-card">
            <span className="profit-label">Ingresos</span>
            <span className="profit-value">{formatCurrency(summary.revenue)}</span>
          </div>
          <div className="profit-card">
            <span className="profit-label">Costos reales</span>
            <span className="profit-value" style={{ color: 'var(--color-danger)' }}>{formatCurrency(summary.totalActual)}</span>
          </div>
          <div className="profit-card">
            <span className="profit-label">Margen bruto</span>
            <span className="profit-value" style={{ color: summary.grossMargin >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {formatCurrency(summary.grossMargin)}
            </span>
          </div>
          <div className="profit-card">
            <span className="profit-label">Margen %</span>
            <span className="profit-value" style={{ color: summary.marginRate >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {summary.marginRate.toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-4)' }}>
        <button className="btn btn-primary" style={{ fontSize: 'var(--text-sm)' }} onClick={openCreate}>
          + Agregar costo
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--color-bg)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
          <div className="form-grid-2">
            <div className="input-field">
              <label className="input-label">Categoría</label>
              <select className="select-field" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
              </select>
            </div>
            <div className="input-field">
              <label className="input-label">Descripción <span className="input-required">*</span></label>
              <input className="input" type="text" value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required />
            </div>
            <div className="input-field">
              <label className="input-label">Costo estimado</label>
              <input className="input" type="number" min="0" step="0.01" value={form.estimatedAmount}
                onChange={(e) => setForm((f) => ({ ...f, estimatedAmount: e.target.value }))} />
            </div>
            <div className="input-field">
              <label className="input-label">Costo real</label>
              <input className="input" type="number" min="0" step="0.01" value={form.actualAmount}
                onChange={(e) => setForm((f) => ({ ...f, actualAmount: e.target.value }))} />
            </div>
            <div className="input-field">
              <label className="input-label">Proveedor</label>
              <input className="input" type="text" value={form.vendor}
                onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value }))} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      )}

      {costs.length === 0 ? (
        <p className="text-muted">Sin costos registrados.</p>
      ) : (
        <table className="table">
          <thead>
            <tr><th>Categoría</th><th>Descripción</th><th>Proveedor</th><th>Estimado</th><th>Real</th><th></th></tr>
          </thead>
          <tbody>
            {costs.map((c) => (
              <tr key={c.id}>
                <td><span className="badge badge-neutral">{CATEGORY_LABEL[c.category]}</span></td>
                <td>{c.description}</td>
                <td>{c.vendor || '—'}</td>
                <td>{formatCurrency(c.estimatedAmount)}</td>
                <td>{formatCurrency(c.actualAmount)}</td>
                <td style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button className="link-btn" onClick={() => openEdit(c)}>Editar</button>
                  <button className="link-btn" style={{ color: 'var(--color-danger)' }} onClick={() => handleDelete(c.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
