import { useState, useEffect } from 'react';
import { eventsApi } from '../../lib/api/events.api.js';
import { Table } from '../ui/Table.jsx';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Modal } from '../ui/Modal.jsx';
import { EventForm } from './EventForm.jsx';
import { formatDate, formatCurrency } from '../../lib/utils/format.js';

const STATUS_LABELS = {
  CONFIRMADO: 'Confirmado',
  EN_PRODUCCION: 'En producción',
  REALIZADO: 'Realizado',
  CANCELADO: 'Cancelado',
  POSPUESTO: 'Pospuesto',
};

const STATUS_VARIANT = {
  CONFIRMADO: 'success',
  EN_PRODUCCION: 'warning',
  REALIZADO: 'neutral',
  CANCELADO: 'danger',
  POSPUESTO: 'warning',
};

const COLUMNS = [
  { key: 'number', label: 'N°', render: (r) => <a href={`/eventos/${r.id}`}>{r.number}</a> },
  { key: 'name', label: 'Nombre del evento', render: (r) => <a href={`/eventos/${r.id}`}>{r.name}</a> },
  { key: 'company', label: 'Empresa', render: (r) => r.company?.name || '—' },
  { key: 'eventDate', label: 'Fecha', render: (r) => formatDate(r.eventDate) },
  { key: 'room', label: 'Salón', render: (r) => r.room?.name || '—' },
  { key: 'totalValue', label: 'Valor', render: (r) => formatCurrency(r.totalValue) },
  {
    key: 'status', label: 'Estado',
    render: (r) => (
      <span className={`badge badge-${STATUS_VARIANT[r.status] || 'neutral'}`}>
        {STATUS_LABELS[r.status] || r.status}
      </span>
    ),
  },
];

export function EventList() {
  const [events, setEvents] = useState([]);
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
      const res = await eventsApi.list(params);
      setEvents(res.data);
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
      <div className="page-header">
        <h1 className="page-title">Eventos</h1>
        <Button onClick={() => setShowModal(true)}>Nuevo evento</Button>
      </div>

      <div className="page-filters">
        <select
          className="input-control"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ maxWidth: 200 }}
        >
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <Table columns={COLUMNS} rows={events} loading={loading} emptyText="No hay eventos registrados" />

      {meta && <p className="table-meta">Mostrando {events.length} de {meta.total}</p>}

      <Modal open={showModal} title="Nuevo evento" onClose={() => setShowModal(false)}>
        <EventForm
          onSaved={() => { setShowModal(false); load(); }}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}
