import { useState, useEffect } from 'react';
import { usersApi } from '../../lib/api/users.api.js';
import { Table } from '../ui/Table.jsx';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Modal } from '../ui/Modal.jsx';
import { UserForm } from './UserForm.jsx';
import { formatDate } from '../../lib/utils/format.js';

const ROLE_LABELS = {
  DIRECCION_GENERAL: 'Dirección General',
  GERENCIA_HOTEL: 'Gerencia Hotel',
  LIDER_COMERCIAL: 'Líder Comercial',
  EJECUTIVO_COMERCIAL: 'Ejecutivo Comercial',
  COORDINACION_OPERATIVA: 'Coord. Operativa',
  FINANCIERO: 'Financiero',
  CALIDAD: 'Calidad',
  ADMINISTRADOR: 'Administrador',
};

const STATUS_LABELS = { ACTIVO: 'Activo', INACTIVO: 'Inactivo', SUSPENDIDO: 'Suspendido' };

const COLUMNS = [
  { key: 'name', label: 'Nombre' },
  { key: 'email', label: 'Correo' },
  { key: 'role', label: 'Rol', render: (r) => ROLE_LABELS[r.role] || r.role },
  { key: 'status', label: 'Estado', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'lastLoginAt', label: 'Último acceso', render: (r) => formatDate(r.lastLoginAt) },
  {
    key: 'actions', label: '', width: 80,
    render: (r, onEdit) => (
      <button className="link-btn" onClick={() => onEdit(r)}>Editar</button>
    ),
  },
];

function StatusBadge({ status }) {
  const classes = { ACTIVO: 'badge-success', INACTIVO: 'badge-neutral', SUSPENDIDO: 'badge-danger' };
  return <span className={`badge ${classes[status] || ''}`}>{STATUS_LABELS[status] || status}</span>;
}

export function UserList() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await usersApi.list();
      setUsers(res.data);
      setMeta(res.meta);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleEdit = (user) => { setEditing(user); setShowModal(true); };
  const handleNew = () => { setEditing(null); setShowModal(true); };
  const handleSaved = () => { setShowModal(false); load(); };

  const columnsWithActions = COLUMNS.map((col) =>
    col.key === 'actions'
      ? { ...col, render: (r) => col.render(r, handleEdit) }
      : col
  );

  return (
    <div className="page-container">
      <div className="page-filters">
        <Button style={{ marginLeft: 'auto' }} onClick={handleNew}>Nuevo usuario</Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <Table columns={columnsWithActions} rows={users} loading={loading} emptyText="No hay usuarios registrados" />

      {meta && (
        <p className="table-meta">
          Mostrando {users.length} de {meta.total} usuarios
        </p>
      )}

      <Modal open={showModal} title={editing ? 'Editar usuario' : 'Nuevo usuario'} onClose={() => setShowModal(false)}>
        <UserForm initial={editing} onSaved={handleSaved} onCancel={() => setShowModal(false)} />
      </Modal>
    </div>
  );
}
