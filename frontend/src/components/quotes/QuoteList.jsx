import { useState, useEffect } from 'react';
import { quotesApi } from '../../lib/api/quotes.api.js';
import { Table } from '../ui/Table.jsx';
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

const COLUMNS = [
  { key: 'number', label: 'N°', render: (r) => <a href={`/cotizaciones/${r.id}`}>{r.number}</a> },
  { key: 'company', label: 'Empresa', render: (r) => r.company?.name || '—' },
  { key: 'eventDate', label: 'Fecha evento', render: (r) => formatDate(r.eventDate) },
  { key: 'total', label: 'Total', render: (r) => formatCurrency(r.total) },
  {
    key: 'status', label: 'Estado',
    render: (r) => (
      <span className={`badge badge-${STATUS_VARIANT[r.status] || 'neutral'}`}>
        {STATUS_LABELS[r.status] || r.status}
      </span>
    ),
  },
  { key: 'createdBy', label: 'Creado por', render: (r) => r.createdBy?.name || '—' },
];

export function QuoteList() {
  const [quotes, setQuotes] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await quotesApi.list(params);
      setQuotes(res.data);
      setMeta(res.meta);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  return (
    <div className="page-container">
      <div className="page-filters">
        <select
          className="input-control"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ maxWidth: 180 }}
        >
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <Button style={{ marginLeft: 'auto' }} onClick={() => setShowModal(true)}>Nueva cotización</Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <Table columns={COLUMNS} rows={quotes} loading={loading} emptyText="No hay cotizaciones registradas" />

      {meta && <p className="table-meta">Mostrando {quotes.length} de {meta.total}</p>}

      <Modal open={showModal} title="Nueva cotización" size="lg" onClose={() => setShowModal(false)}>
        <QuoteForm
          onSaved={() => { setShowModal(false); load(); }}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}
