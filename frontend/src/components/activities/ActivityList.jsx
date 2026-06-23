import { useState, useEffect } from 'react';
import { activitiesApi } from '../../lib/api/activities.api.js';
import { Table } from '../ui/Table.jsx';
import { Alert } from '../ui/Alert.jsx';
import { formatDate, formatDateTime } from '../../lib/utils/format.js';

const COLUMNS = [
  { key: 'date', label: 'Fecha', render: (r) => formatDateTime(r.date) },
  { key: 'company', label: 'Empresa', render: (r) => r.companyId?.name || '—' },
  { key: 'type', label: 'Tipo' },
  { key: 'result', label: 'Resultado' },
  { key: 'attachments', label: 'Evidencias', render: (r) => {
    const list = r.attachments || [];
    if (list.length === 0) return '—';
    return list.map((a, i) => (
      <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-primary)' }}>
        📎 {a.originalName}
      </a>
    ));
  }},
  { key: 'owner', label: 'Registrado por', render: (r) => r.ownerId?.name || '—' },
  { key: 'nextActionAt', label: 'Próxima acción', render: (r) => formatDate(r.nextActionAt) },
];

export function ActivityList() {
  const [activities, setActivities] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    activitiesApi.list().then((res) => {
      setActivities(res.data);
      setMeta(res.meta);
    }).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
{error && <Alert type="error" message={error} onClose={() => setError('')} />}
      <Table columns={COLUMNS} rows={activities} loading={loading} emptyText="No hay actividades registradas" />
      {meta && <p className="table-meta">Mostrando {activities.length} de {meta.total}</p>}
    </div>
  );
}
