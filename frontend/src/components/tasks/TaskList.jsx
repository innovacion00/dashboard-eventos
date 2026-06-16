import { useState, useEffect } from 'react';
import { tasksApi } from '../../lib/api/tasks.api.js';
import { Table } from '../ui/Table.jsx';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Modal } from '../ui/Modal.jsx';
import { TaskForm } from './TaskForm.jsx';
import { formatDate } from '../../lib/utils/format.js';

const STATUS_LABELS = {
  PENDIENTE: 'Pendiente', EN_PROGRESO: 'En progreso',
  COMPLETADA: 'Completada', CANCELADA: 'Cancelada', VENCIDA: 'Vencida',
};
const STATUS_VARIANT = {
  PENDIENTE: 'badge-neutral', EN_PROGRESO: 'badge-warning',
  COMPLETADA: 'badge-success', CANCELADA: 'badge-neutral', VENCIDA: 'badge-danger',
};
const PRIORITY_VARIANT = { ALTA: 'badge-danger', MEDIA: 'badge-warning', BAJA: 'badge-neutral' };

const COLUMNS = [
  { key: 'title', label: 'Tarea' },
  {
    key: 'priority', label: 'Prioridad',
    render: (r) => <span className={`badge ${PRIORITY_VARIANT[r.priority]}`}>{r.priority}</span>,
  },
  {
    key: 'status', label: 'Estado',
    render: (r) => <span className={`badge ${STATUS_VARIANT[r.status]}`}>{STATUS_LABELS[r.status]}</span>,
  },
  { key: 'assigneeId', label: 'Asignado', render: (r) => r.assigneeId?.name || '—' },
  { key: 'dueDate', label: 'Vencimiento', render: (r) => formatDate(r.dueDate) },
  {
    key: 'actions', label: '', width: 160,
    render: (r, onEdit, onStatus) => (
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <button className="link-btn" onClick={() => onEdit(r)}>Editar</button>
        {r.status === 'PENDIENTE' && (
          <button className="link-btn" onClick={() => onStatus(r._id || r.id, 'COMPLETADA')}>Completar</button>
        )}
      </div>
    ),
  },
];

export function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await tasksApi.list(params);
      setTasks(res.data);
      setMeta(res.meta);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleChangeStatus = async (id, status) => {
    try {
      await tasksApi.changeStatus(id, status);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const columns = COLUMNS.map((col) =>
    col.key === 'actions'
      ? { ...col, render: (r) => col.render(r, (t) => { setEditing(t); setModal(true); }, handleChangeStatus) }
      : col
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Tareas</h1>
        <Button onClick={() => { setEditing(null); setModal(true); }}>Nueva tarea</Button>
      </div>

      <div className="page-filters">
        <select className="input-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      <Table columns={columns} rows={tasks} loading={loading} emptyText="No hay tareas" />
      {meta && <p className="table-meta">Mostrando {tasks.length} de {meta.total}</p>}

      <Modal open={modal} title={editing ? 'Editar tarea' : 'Nueva tarea'} onClose={() => setModal(false)}>
        <TaskForm initial={editing} onSaved={() => { setModal(false); load(); }} onCancel={() => setModal(false)} />
      </Modal>
    </div>
  );
}
