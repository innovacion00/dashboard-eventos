import { useState, useEffect } from 'react';
import { eventCostsApi } from '../../lib/api/event-costs.api.js';
import { Alert } from '../ui/Alert.jsx';
import { formatCurrency } from '../../lib/utils/format.js';

const CATEGORIES = ['AB', 'AV', 'SALON', 'PERSONAL', 'PROVEEDOR', 'OTRO'];
const CATEGORY_LABEL = {
  AB: 'A&B', AV: 'Audiovisual', SALON: 'Salón', PERSONAL: 'Personal', PROVEEDOR: 'Proveedor', OTRO: 'Otro', OTROS: 'Otros', EXTERNO: 'Externo',
};

const EMPTY_FORM = {
  category: 'AB', description: '', estimatedAmount: '', actualAmount: '', vendor: '', notes: '',
};

export function EventCostsPanel({ eventId, revenue = 0 }) {
  const [costs, setCosts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [costsRes, summaryRes, breakdownRes] = await Promise.all([
        eventCostsApi.listByEvent(eventId),
        eventCostsApi.getSummary(eventId, revenue),
        eventCostsApi.getProfitBreakdown(eventId),
      ]);
      setCosts(costsRes.data || []);
      setSummary(summaryRes.data);
      setBreakdown(breakdownRes.data);
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

      {breakdown && breakdown.categories.length > 0 && (
        <div className="table-wrapper" style={{ marginBottom: 'var(--space-6)' }}>
          <table className="table" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '25%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '25%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Venta antes de imp.</th>
                <th style={{ color: 'var(--color-danger)' }}>Costo</th>
                <th style={{ color: 'var(--color-success)' }}>Utilidad</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.categories.map((cat) => (
                <tr key={cat.category}>
                  <td><span className="badge badge-neutral">{CATEGORY_LABEL[cat.category] || cat.category}</span></td>
                  <td style={{ fontWeight: 500 }}>{formatCurrency(cat.revenue)}</td>
                  <td style={{ color: 'var(--color-danger)', fontWeight: 500 }}>{formatCurrency(cat.cost)}</td>
                  <td style={{ color: 'var(--color-success)', fontWeight: 500 }}>{formatCurrency(cat.profit)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: 'var(--color-surface)', fontWeight: 700 }}>
                <td>Total</td>
                <td>{formatCurrency(breakdown.totals.revenue)}</td>
                <td style={{ color: 'var(--color-danger)' }}>{formatCurrency(breakdown.totals.cost)}</td>
                <td style={{ color: 'var(--color-success)' }}>{formatCurrency(breakdown.totals.profit)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {(summary || breakdown) && (() => {
        const hasBreakdownData = breakdown && breakdown.categories.length > 0;
        const ingresos = hasBreakdownData ? breakdown.totals.revenue : (summary?.revenue || 0);
        const costos = hasBreakdownData ? breakdown.totals.cost : (summary?.totalActual || 0);
        const utilidad = hasBreakdownData ? breakdown.totals.profit : (summary?.grossMargin || 0);
        const margen = hasBreakdownData
          ? breakdown.totals.profitRate
          : (summary?.marginRate || 0);

        return (
          <div className="profitability-summary" style={{ marginBottom: 'var(--space-5)' }}>
            <div className="profit-card" style={{ gridColumn: 'span 2' }}>
              <span className="profit-label">Ingresos (antes de imp.)</span>
              <span className="profit-value">{formatCurrency(ingresos)}</span>
            </div>
            <div className="profit-card">
              <span className="profit-label">Costos</span>
              <span className="profit-value" style={{ color: 'var(--color-danger)' }}>{formatCurrency(costos)}</span>
            </div>
            <div className="profit-card">
              <span className="profit-label">Utilidad</span>
              <span className="profit-value" style={{ color: utilidad >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {formatCurrency(utilidad)}
              </span>
            </div>
            <div className="profit-card">
              <span className="profit-label">Margen %</span>
              <span className="profit-value" style={{ color: margen >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {margen.toFixed(1)}%
              </span>
            </div>
          </div>
        );
      })()}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
          Costos registrados
        </h3>
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
