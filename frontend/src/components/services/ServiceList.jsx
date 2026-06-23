import { useState, useEffect } from 'react';
import { servicesApi } from '../../lib/api/services.api.js';
import { Table } from '../ui/Table.jsx';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Modal } from '../ui/Modal.jsx';
import { formatCurrency } from '../../lib/utils/format.js';

const CATEGORY_LABELS = { SALON: 'Salón', AB: 'A&B', AV: 'AV', OTROS: 'Otros', EXTERNO: 'Externo' };
const CATEGORIES = Object.entries(CATEGORY_LABELS);

const TAX_RATE = (category) => category === 'AB' ? 8 : 19;
const totalPrice = (unitPrice, category) => {
  const rate = TAX_RATE(category);
  return unitPrice * (1 + rate / 100);
};

const COLUMNS = [
  { key: 'name', label: 'Nombre' },
  { key: 'category', label: 'Categoría', render: (r) => CATEGORY_LABELS[r.category] || r.category },
  { key: 'unitPrice', label: 'Precio base', render: (r) => `${formatCurrency(r.unitPrice)} / ${r.unit || 'unidad'}` },
  { key: 'taxRate', label: 'Impuesto', render: (r) => { const rate = r.taxRate ?? TAX_RATE(r.category); return `${formatCurrency(r.unitPrice * rate / 100)} / ${r.unit || 'unidad'}`; } },
  { key: 'totalPrice', label: 'Total c/impuesto', render: (r) => `${formatCurrency(totalPrice(r.unitPrice, r.category))} / ${r.unit || 'unidad'}` },
  { key: 'description', label: 'Descripción', render: (r) => r.description || '—' },
];

function ServiceForm({ service, onSaved, onCancel }) {
  const isEdit = Boolean(service);
  const [form, setForm] = useState({
    name: service?.name || '',
    description: service?.description || '',
    category: service?.category || 'OTROS',
    unitPrice: service?.unitPrice ?? '',
    unit: service?.unit || 'unidad',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (f, v) => setForm(s => ({ ...s, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...form, unitPrice: Number(form.unitPrice) };
      if (isEdit) {
        await servicesApi.update(service.id, payload);
      } else {
        await servicesApi.create(payload);
      }
      onSaved?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      <div className="form-grid-2">
        <div className="input-field">
          <label className="input-label">Nombre <span className="input-required">*</span></label>
          <input className="input-control" value={form.name} onChange={e => set('name', e.target.value)} required />
        </div>
        <div className="input-field">
          <label className="input-label">Categoría <span className="input-required">*</span></label>
          <select className="input-control" value={form.category} onChange={e => set('category', e.target.value)} required>
            {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="input-field">
          <label className="input-label">Precio unitario <span className="input-required">*</span></label>
          <input className="input-control" type="number" min="0" step="any" value={form.unitPrice} onChange={e => set('unitPrice', e.target.value)} required />
        </div>
        <div className="input-field">
          <label className="input-label">Unidad</label>
          <input className="input-control" value={form.unit} onChange={e => set('unit', e.target.value)} placeholder="persona, hora, unidad..." />
        </div>
        <div className="input-field">
          <label className="input-label">Impuesto</label>
          <input className="input-control" value={form.unitPrice !== '' ? formatCurrency(Number(form.unitPrice) * TAX_RATE(form.category) / 100) : '—'} readOnly style={{ background: 'var(--color-bg-subtle)', color: 'var(--color-text-muted)' }} />
        </div>
        <div className="input-field">
          <label className="input-label">Total con impuesto</label>
          <input className="input-control" value={form.unitPrice !== '' ? formatCurrency(totalPrice(Number(form.unitPrice), form.category)) : '—'} readOnly style={{ background: 'var(--color-bg-subtle)', color: 'var(--color-text-muted)' }} />
        </div>
      </div>
      <div className="input-field">
        <label className="input-label">Descripción</label>
        <textarea className="input-control" rows={2} value={form.description} onChange={e => set('description', e.target.value)} />
      </div>
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear servicio'}</Button>
      </div>
    </form>
  );
}

export function ServiceList() {
  const [services, setServices] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (categoryFilter) params.category = categoryFilter;
      const res = await servicesApi.list(params);
      setServices(res.data);
      setMeta(res.meta);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); }, [categoryFilter]);
  useEffect(() => { load(); }, [page, categoryFilter]);

  const cols = [
    ...COLUMNS,
    {
      key: '_actions', label: '',
      render: (r) => (
        <button className="link-btn" onClick={() => { setEditing(r); setShowModal(true); }}>Editar</button>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-filters">
        <select className="input-control" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="">Todas las categorías</option>
          {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <Button style={{ marginLeft: 'auto' }} onClick={() => { setEditing(null); setShowModal(true); }}>Nuevo servicio</Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <Table columns={cols} rows={services} loading={loading} emptyText="No hay servicios registrados" />

      {meta && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-3)' }}>
          <p className="table-meta" style={{ margin: 0 }}>Mostrando {services.length} de {meta.total}</p>
          {meta.totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Button variant="secondary" onClick={() => setPage(p => p - 1)} disabled={page <= 1 || loading}>Anterior</Button>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Página {page} de {meta.totalPages}</span>
              <Button variant="secondary" onClick={() => setPage(p => p + 1)} disabled={page >= meta.totalPages || loading}>Siguiente</Button>
            </div>
          )}
        </div>
      )}

      <Modal
        open={showModal}
        title={editing ? 'Editar servicio' : 'Nuevo servicio'}
        onClose={() => { setShowModal(false); setEditing(null); }}
      >
        <ServiceForm
          service={editing}
          onSaved={() => { setShowModal(false); setEditing(null); load(); }}
          onCancel={() => { setShowModal(false); setEditing(null); }}
        />
      </Modal>
    </div>
  );
}
