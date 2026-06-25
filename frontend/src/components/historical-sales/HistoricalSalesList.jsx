import { useState, useEffect } from 'react';
import { historicalSalesApi } from '../../lib/api/historical-sales.api.js';
import { api } from '../../lib/api/client.js';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';
import { formatCurrency } from '../../lib/utils/format.js';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export function HistoricalSalesList() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear() - 1);
  const [sales, setSales] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ month: 1, executiveId: '', confirmedSales: '', confirmedEvents: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    api.get('/users?limit=100').then(res => setUsers(res.data || [])).catch(() => {});
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await historicalSalesApi.list({ year });
      setSales(res.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [year]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        year,
        month: Number(form.month),
        executiveId: form.executiveId,
        confirmedSales: Number(form.confirmedSales),
        confirmedEvents: Number(form.confirmedEvents) || 0,
        notes: form.notes || undefined,
      };
      if (editingId) {
        await historicalSalesApi.update(editingId, {
          confirmedSales: payload.confirmedSales,
          confirmedEvents: payload.confirmedEvents,
          notes: payload.notes,
        });
      } else {
        await historicalSalesApi.create(payload);
      }
      setForm({ month: 1, executiveId: '', confirmedSales: '', confirmedEvents: '', notes: '' });
      setShowForm(false);
      setEditingId(null);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (s) => {
    setForm({
      month: s.month,
      executiveId: s.executiveId?._id || s.executiveId,
      confirmedSales: s.confirmedSales,
      confirmedEvents: s.confirmedEvents || 0,
      notes: s.notes || '',
    });
    setEditingId(s._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await historicalSalesApi.remove(id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const salesByMonth = {};
  for (const s of sales) {
    if (!salesByMonth[s.month]) salesByMonth[s.month] = [];
    salesByMonth[s.month].push(s);
  }

  return (
    <div className="page-container">
      <div className="page-filters">
        <select className="input-control" value={year} onChange={e => setYear(Number(e.target.value))} style={{ maxWidth: 100 }}>
          {Array.from({ length: 5 }, (_, i) => now.getFullYear() - 4 + i).map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <Button style={{ marginLeft: 'auto' }} onClick={() => { setEditingId(null); setForm({ month: 1, executiveId: '', confirmedSales: '', confirmedEvents: '', notes: '' }); setShowForm(!showForm); }}>
          {showForm ? 'Cancelar' : 'Registrar venta'}
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ padding: 'var(--space-4)', background: 'var(--color-gray-1)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
          <div className="form-grid-2">
            <div className="input-field">
              <label className="input-label">Mes</label>
              <select className="input-control" value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))} disabled={!!editingId}>
                {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div className="input-field">
              <label className="input-label">Ejecutivo comercial <span className="input-required">*</span></label>
              <select className="input-control" value={form.executiveId} onChange={e => setForm(f => ({ ...f, executiveId: e.target.value }))} required disabled={!!editingId}>
                <option value="">Seleccionar...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="input-field">
              <label className="input-label">Ventas confirmadas (COP) <span className="input-required">*</span></label>
              <input className="input-control" type="number" min="0" value={form.confirmedSales} onChange={e => setForm(f => ({ ...f, confirmedSales: e.target.value }))} required />
            </div>
            <div className="input-field">
              <label className="input-label">Cantidad de eventos</label>
              <input className="input-control" type="number" min="0" value={form.confirmedEvents} onChange={e => setForm(f => ({ ...f, confirmedEvents: e.target.value }))} />
            </div>
          </div>
          <div className="input-field">
            <label className="input-label">Notas</label>
            <input className="input-control" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="form-actions">
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Registrar'}</Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-muted">Cargando...</p>
      ) : sales.length === 0 ? (
        <p className="text-muted">No hay ventas históricas registradas para {year}.</p>
      ) : (
        MONTHS.map((monthName, i) => {
          const monthSales = salesByMonth[i + 1];
          if (!monthSales) return null;
          const monthTotal = monthSales.reduce((s, h) => s + (h.confirmedSales || 0), 0);
          const monthEvents = monthSales.reduce((s, h) => s + (h.confirmedEvents || 0), 0);
          return (
            <div key={i} className="panel" style={{ marginBottom: 'var(--space-3)' }}>
              <div className="section-header">
                <span className="section-title">{monthName} {year}</span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gold-dark)', fontWeight: 'var(--font-bold)' }}>
                  {formatCurrency(monthTotal)} — {monthEvents} evento(s)
                </span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                <thead>
                  <tr style={{ background: 'var(--color-gray-1)' }}>
                    <th style={{ padding: '6px 12px', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>Ejecutivo</th>
                    <th style={{ padding: '6px 12px', textAlign: 'right', borderBottom: '1px solid var(--color-border)' }}>Ventas</th>
                    <th style={{ padding: '6px 12px', textAlign: 'right', borderBottom: '1px solid var(--color-border)' }}>Eventos</th>
                    <th style={{ padding: '6px 12px', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>Notas</th>
                    <th style={{ padding: '6px 12px', borderBottom: '1px solid var(--color-border)' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {monthSales.map(s => (
                    <tr key={s._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '6px 12px' }}>{s.executiveId?.name || '—'}</td>
                      <td style={{ padding: '6px 12px', textAlign: 'right', fontWeight: 'var(--font-semibold)' }}>{formatCurrency(s.confirmedSales)}</td>
                      <td style={{ padding: '6px 12px', textAlign: 'right' }}>{s.confirmedEvents || 0}</td>
                      <td style={{ padding: '6px 12px', color: 'var(--color-text-muted)' }}>{s.notes || '—'}</td>
                      <td style={{ padding: '6px 12px' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          <button className="link-btn" onClick={() => handleEdit(s)}>Editar</button>
                          <button className="link-btn link-btn--danger" onClick={() => handleDelete(s._id)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })
      )}
    </div>
  );
}
