import { useState, useEffect } from 'react';
import { vendorsApi } from '../../lib/api/vendors.api.js';
import { Table } from '../ui/Table.jsx';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Modal } from '../ui/Modal.jsx';

const CATEGORY_LABELS = {
  AB: 'A&B',
  SALON: 'Salón',
  AV: 'AV',
  OTROS: 'Otros',
  EXTERNO: 'Externo',
};
const CATEGORIES = Object.entries(CATEGORY_LABELS);

const COLUMNS = [
  { key: 'name', label: 'Nombre' },
  { key: 'category', label: 'Categoría', render: (r) => CATEGORY_LABELS[r.category] || r.category },
  { key: 'contactName', label: 'Contacto', render: (r) => r.contactName || '—' },
  { key: 'phone', label: 'Teléfono', render: (r) => r.phone || '—' },
  { key: 'email', label: 'Correo', render: (r) => r.email || '—' },
  { key: 'nit', label: 'NIT', render: (r) => r.nit || '—' },
  { key: 'services', label: 'Servicios', render: (r) => r.services || '—' },
];

function VendorForm({ vendor, onSaved, onCancel }) {
  const isEdit = Boolean(vendor);
  const [form, setForm] = useState({
    name: vendor?.name || '',
    category: vendor?.category || 'OTROS',
    contactName: vendor?.contactName || '',
    phone: vendor?.phone || '',
    email: vendor?.email || '',
    nit: vendor?.nit || '',
    address: vendor?.address || '',
    services: vendor?.services || '',
    notes: vendor?.notes || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (f, v) => setForm((s) => ({ ...s, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await vendorsApi.update(vendor.id, form);
      } else {
        await vendorsApi.create(form);
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
          <input className="input-control" value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </div>
        <div className="input-field">
          <label className="input-label">Categoría <span className="input-required">*</span></label>
          <select className="input-control" value={form.category} onChange={(e) => set('category', e.target.value)} required>
            {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="input-field">
          <label className="input-label">Persona de contacto</label>
          <input className="input-control" value={form.contactName} onChange={(e) => set('contactName', e.target.value)} />
        </div>
        <div className="input-field">
          <label className="input-label">Teléfono</label>
          <input className="input-control" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </div>
        <div className="input-field">
          <label className="input-label">Correo electrónico</label>
          <input className="input-control" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </div>
        <div className="input-field">
          <label className="input-label">NIT</label>
          <input className="input-control" value={form.nit} onChange={(e) => set('nit', e.target.value)} />
        </div>
      </div>
      <div className="input-field">
        <label className="input-label">Dirección</label>
        <input className="input-control" value={form.address} onChange={(e) => set('address', e.target.value)} />
      </div>
      <div className="input-field">
        <label className="input-label">Servicios que ofrece</label>
        <textarea className="input-control" rows={2} value={form.services} onChange={(e) => set('services', e.target.value)} />
      </div>
      <div className="input-field">
        <label className="input-label">Notas</label>
        <textarea className="input-control" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
      </div>
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear proveedor'}</Button>
      </div>
    </form>
  );
}

export function VendorList() {
  const [vendors, setVendors] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (search) params.q = search;
      const res = await vendorsApi.list(params);
      setVendors(res.data);
      setMeta(res.meta);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [categoryFilter, search]);

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
        <input
          className="input-control"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 260 }}
        />
        <select className="input-control" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ maxWidth: 220 }}>
          <option value="">Todas las categorías</option>
          {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <Button style={{ marginLeft: 'auto' }} onClick={() => { setEditing(null); setShowModal(true); }}>Nuevo proveedor</Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <Table columns={cols} rows={vendors} loading={loading} emptyText="No hay proveedores registrados" />

      {meta && <p className="table-meta">Mostrando {vendors.length} de {meta.total}</p>}

      <Modal
        open={showModal}
        title={editing ? 'Editar proveedor' : 'Nuevo proveedor'}
        onClose={() => { setShowModal(false); setEditing(null); }}
        size="lg"
      >
        <VendorForm
          vendor={editing}
          onSaved={() => { setShowModal(false); setEditing(null); load(); }}
          onCancel={() => { setShowModal(false); setEditing(null); }}
        />
      </Modal>
    </div>
  );
}
