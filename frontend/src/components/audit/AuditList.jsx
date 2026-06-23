import { useState, useEffect } from 'react';
import { api } from '../../lib/api/client.js';
import { Table } from '../ui/Table.jsx';
import { Alert } from '../ui/Alert.jsx';
import { formatDateTime } from '../../lib/utils/format.js';

const ACTION_VARIANT = {
  CREATE: 'badge-success', UPDATE: 'badge-warning',
  DELETE: 'badge-danger', LOGIN: 'badge-neutral', STAGE_CHANGE: 'badge-warning',
};

const COLUMNS = [
  { key: 'createdAt', label: 'Fecha', render: (r) => formatDateTime(r.createdAt) },
  { key: 'userEmail', label: 'Usuario' },
  { key: 'module', label: 'Módulo' },
  {
    key: 'action', label: 'Acción',
    render: (r) => <span className={`badge ${ACTION_VARIANT[r.action] || 'badge-neutral'}`}>{r.action}</span>,
  },
  { key: 'entityId', label: 'Entidad', render: (r) => r.entityId ? String(r.entityId).slice(-8) : '—' },
  { key: 'ip', label: 'IP', render: (r) => r.ip || '—' },
];

export function AuditList() {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: 50 });
      if (moduleFilter) params.set('module', moduleFilter);
      const res = await api.get(`/audit-logs?${params}`);
      setLogs(res.data);
      setMeta(res.meta);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [moduleFilter]);

  const MODULES = ['users', 'companies', 'contacts', 'activities', 'opportunities', 'tasks', 'goals'];

  return (
    <div className="page-container">
<div className="page-filters">
        <select className="input-control" value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="">Todos los módulos</option>
          {MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      <Table columns={COLUMNS} rows={logs} loading={loading} emptyText="No hay registros" />
      {meta && <p className="table-meta">Mostrando {logs.length} de {meta.total}</p>}
    </div>
  );
}
