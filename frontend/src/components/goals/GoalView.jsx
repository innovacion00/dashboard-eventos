import { useState, useEffect } from 'react';
import { goalsApi } from '../../lib/api/goals.api.js';
import { usersApi } from '../../lib/api/users.api.js';
import { Table } from '../ui/Table.jsx';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Modal } from '../ui/Modal.jsx';
import { GoalForm } from './GoalForm.jsx';
import { formatCurrency } from '../../lib/utils/format.js';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export function GoalView() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [goals, setGoals] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [editGoal, setEditGoal] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await goalsApi.get({ year });
      const data = res.data;
      setGoals(Array.isArray(data) ? data : (data ? [data] : []));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    usersApi.list({ limit: 100 }).then(res => {
      const execs = (res.data || []).filter(u =>
        u.role === 'EJECUTIVO_COMERCIAL' || u.role === 'LIDER_COMERCIAL'
      );
      setUsers(execs);
    }).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [year]);

  const openEdit = (goal) => {
    setEditGoal(goal);
    setModal('edit');
  };

  const openNew = () => {
    setEditGoal(null);
    setModal('new');
  };

  const handleDelete = async (goal) => {
    if (!confirm(`¿Eliminar la meta de ${MONTHS[goal.month - 1]} ${goal.year}${goal.user ? ` (${goal.user.name})` : ''}?`)) return;
    try {
      await goalsApi.remove(goal.id);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const COLUMNS = [
    { key: 'month', label: 'Mes', render: (g) => MONTHS[g.month - 1] || g.month },
    { key: 'user', label: 'Asignada a', render: (g) => <strong>{g.user?.name || 'General'}</strong> },
    { key: 'revenueTarget', label: 'Meta de ingresos', render: (g) => formatCurrency(g.revenueTarget) },
    { key: 'eventCountTarget', label: 'Meta de eventos', render: (g) => g.eventCountTarget ?? '—' },
    { key: 'averageTicketTarget', label: 'Ticket promedio', render: (g) => g.averageTicketTarget ? formatCurrency(g.averageTicketTarget) : '—' },
    { key: 'marginTarget', label: 'Margen', render: (g) => g.marginTarget != null ? `${g.marginTarget}%` : '—' },
    { key: 'presaleThreshold', label: 'Preventa', render: (g) => `${g.presaleThreshold}%` },
    {
      key: 'actions', label: '',
      render: (g) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="link-btn" onClick={() => openEdit(g)}>Editar</button>
          <button className="link-btn" style={{ color: 'var(--color-danger)' }} onClick={() => handleDelete(g)}>Eliminar</button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-filters">
        <select className="input-control" value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ maxWidth: 100 }}>
          {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <Button style={{ marginLeft: 'auto' }} onClick={openNew}>Crear meta</Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <Table
        columns={COLUMNS}
        rows={goals}
        loading={loading}
        emptyText={`No hay metas definidas para ${year}.`}
      />

      <Modal open={modal === 'new' || modal === 'edit'} title={modal === 'edit' ? 'Editar meta' : 'Nueva meta'} onClose={() => setModal(null)} size="sm">
        <GoalForm
          initial={editGoal}
          defaultYear={year}
          defaultMonth={now.getMonth() + 1}
          onSaved={() => { setModal(null); load(); }}
          onCancel={() => setModal(null)}
        />
      </Modal>
    </div>
  );
}
