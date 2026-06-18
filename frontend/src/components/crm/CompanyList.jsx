import { useState, useEffect } from 'react';
import { companiesApi } from '../../lib/api/companies.api.js';
import { Table } from '../ui/Table.jsx';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Modal } from '../ui/Modal.jsx';
import { CompanyForm } from './CompanyForm.jsx';
import { CompanyImport } from './CompanyImport.jsx';

const STATUS_LABELS = {
  PROSPECTO: 'Prospecto',
  CLIENTE_ACTIVO: 'Cliente activo',
  CLIENTE_INACTIVO: 'Cliente inactivo',
  ALIADO: 'Aliado',
  AGENCIA: 'Agencia',
  GUBERNAMENTAL: 'Gubernamental',
};

const COLUMNS = [
  { key: 'name', label: 'Nombre', render: (r) => <a href={`/empresas/${r.id}`}>{r.name}</a> },
  { key: 'segment', label: 'Segmento' },
  { key: 'status', label: 'Estado', render: (r) => STATUS_LABELS[r.status] || r.status },
  { key: 'contactName', label: 'Contacto', render: (r) => r.contactName || '—' },
  { key: 'contactPosition', label: 'Cargo', render: (r) => r.contactPosition || '—' },
  { key: 'phone', label: 'Teléfono', render: (r) => r.phone || '—' },
  { key: 'email', label: 'Correo', render: (r) => r.email || '—' },
  { key: 'address', label: 'Dirección', render: (r) => r.address || '—' },
];

export function CompanyList() {
  const [companies, setCompanies] = useState([]);
  const [meta, setMeta] = useState(null);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');

  useEffect(() => {
    companiesApi.listSegments().then(res => setSegments(res.data || [])).catch(() => {});
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.q = search;
      if (statusFilter) params.status = statusFilter;
      if (segmentFilter) params.segment = segmentFilter;
      const res = await companiesApi.list(params);
      setCompanies(res.data);
      setMeta(res.meta);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, statusFilter, segmentFilter]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Empresas</h1>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
          <CompanyImport onImported={load} />
          <Button onClick={() => setShowModal(true)}>Nueva empresa</Button>
        </div>
      </div>

      <div className="page-filters">
        <input
          className="input-control"
          placeholder="Buscar empresa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        <select
          className="input-control"
          value={segmentFilter}
          onChange={(e) => setSegmentFilter(e.target.value)}
          style={{ maxWidth: 200 }}
        >
          <option value="">Todos los segmentos</option>
          {segments.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          className="input-control"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ maxWidth: 180 }}
        >
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <Table columns={COLUMNS} rows={companies} loading={loading} emptyText="No hay empresas registradas" />

      {meta && <p className="table-meta">Mostrando {companies.length} de {meta.total}</p>}

      <Modal open={showModal} title="Nueva empresa" onClose={() => setShowModal(false)}>
        <CompanyForm onSaved={() => { setShowModal(false); load(); }} onCancel={() => setShowModal(false)} />
      </Modal>
    </div>
  );
}
