import { useState, useEffect } from 'react';
import { commissionsApi } from '../../lib/api/commissions.api.js';
import { Table } from '../ui/Table.jsx';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Modal } from '../ui/Modal.jsx';
import { formatCurrency } from '../../lib/utils/format.js';
import { CommissionDetail } from './CommissionDetail.jsx';

const STATUS_LABEL = { CALCULADA: 'Calculada', APROBADA: 'Aprobada', PAGADA: 'Pagada', ANULADA: 'Anulada' };
const STATUS_VARIANT = { CALCULADA: 'neutral', APROBADA: 'warning', PAGADA: 'success', ANULADA: 'danger' };
const STATUSES = Object.keys(STATUS_LABEL);
const NEXT = { CALCULADA: 'APROBADA', APROBADA: 'PAGADA' };

export function CommissionList() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const res = await commissionsApi.list(params);
      setItems(res.data || []);
      setMeta(res.meta);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); }, [statusFilter]);
  useEffect(() => { load(); }, [page, statusFilter]);

  const handleAdvance = async (id, newStatus) => {
    try {
      await commissionsApi.changeStatus(id, newStatus);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDetailReload = () => {
    setSelected(null);
    load();
  };

  const columns = [
    {
      key: 'number', label: 'N°',
      render: (r) => (
        <button
          className="link-btn"
          style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-gold-dark)' }}
          onClick={() => setSelected((s) => s?.id === r.id ? null : r)}
        >
          {r.number}
        </button>
      ),
    },
    { key: 'event',        label: 'Evento',      render: (r) => r.event?.number || '—' },
    { key: 'beneficiary',  label: 'Beneficiario', render: (r) => r.beneficiary?.name || r.beneficiaryName || '—' },
    { key: 'type',         label: 'Tipo',         render: (r) => r.beneficiaryType?.replace(/_/g, ' ') || '—' },
    { key: 'amount',       label: 'Comisión',     render: (r) => <strong>{formatCurrency(r.amount)}</strong> },
    {
      key: 'status', label: 'Estado',
      render: (r) => (
        <span className={`badge badge-${STATUS_VARIANT[r.status] || 'neutral'}`}>
          {STATUS_LABEL[r.status] || r.status}
        </span>
      ),
    },
    {
      key: 'actions', label: '',
      render: (r) => NEXT[r.status] ? (
        <button className="link-btn" onClick={() => handleAdvance(r.id, NEXT[r.status])}>
          → {STATUS_LABEL[NEXT[r.status]]}
        </button>
      ) : null,
    },
  ];

  return (
    <div className="page-container">
      <div className="page-filters">
        <select
          className="input-control"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ maxWidth: 200 }}
        >
          <option value="">Todos los estados</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <Button style={{ marginLeft: 'auto' }} onClick={() => setShowModal(true)}>Nueva comisión</Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <Table columns={columns} rows={items} loading={loading} emptyText="No hay comisiones registradas." />

      {meta && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-3)' }}>
          <p className="table-meta" style={{ margin: 0 }}>Mostrando {items.length} de {meta.total}</p>
          {meta.totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Button variant="secondary" onClick={() => setPage((p) => p - 1)} disabled={page <= 1 || loading}>Anterior</Button>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Página {page} de {meta.totalPages}</span>
              <Button variant="secondary" onClick={() => setPage((p) => p + 1)} disabled={page >= meta.totalPages || loading}>Siguiente</Button>
            </div>
          )}
        </div>
      )}

      {selected && (
        <CommissionDetail
          commission={selected}
          onClose={() => setSelected(null)}
          onReload={handleDetailReload}
        />
      )}

      <Modal open={showModal} title="Nueva comisión" onClose={() => setShowModal(false)}>
        <CommissionForm
          onSaved={() => { setShowModal(false); load(); }}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
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
    <div>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      <form onSubmit={handleSubmit}>
        <div className="form-grid-2">
          <div className="input-field">
            <label className="input-label">Evento <span className="input-required">*</span></label>
            <select className="input-control" value={form.eventId} onChange={(e) => setForm((f) => ({ ...f, eventId: e.target.value }))} required>
              <option value="">Seleccionar evento</option>
              {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.number} — {ev.name}</option>)}
            </select>
          </div>
          <div className="input-field">
            <label className="input-label">Tipo de beneficiario</label>
            <select className="input-control" value={form.beneficiaryType} onChange={(e) => setForm((f) => ({ ...f, beneficiaryType: e.target.value }))}>
              {BENEFICIARY_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div className="input-field">
            <label className="input-label">Nombre beneficiario</label>
            <input className="input-control" type="text" value={form.beneficiaryName}
              onChange={(e) => setForm((f) => ({ ...f, beneficiaryName: e.target.value }))} />
          </div>
          <div className="input-field">
            <label className="input-label">Monto base <span className="input-required">*</span></label>
            <input className="input-control" type="number" min="0" step="0.01" value={form.baseAmount}
              onChange={(e) => setForm((f) => ({ ...f, baseAmount: e.target.value }))} required />
          </div>
          <div className="input-field">
            <label className="input-label">Tasa (%) <span className="input-required">*</span></label>
            <input className="input-control" type="number" min="0" max="100" step="0.1"
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
          <textarea className="input-control" rows={2} value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        </div>
        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" loading={saving}>Crear</Button>
        </div>
      </form>
    </div>
  );
}
