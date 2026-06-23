import { useState, useEffect } from 'react';
import { goalsApi } from '../../lib/api/goals.api.js';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Modal } from '../ui/Modal.jsx';
import { GoalForm } from './GoalForm.jsx';
import { formatCurrency } from '../../lib/utils/format.js';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export function GoalView() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await goalsApi.get({ year, month });
      setGoal(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [year, month]);

  return (
    <div className="page-container">
      <div className="page-filters">
        <select className="input-control" value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ maxWidth: 100 }}>
          {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <select className="input-control" value={month} onChange={(e) => setMonth(Number(e.target.value))} style={{ maxWidth: 140 }}>
          {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
        </select>
        <Button style={{ marginLeft: 'auto' }} onClick={() => setModal(goal ? 'edit' : 'new')}>
          {goal ? 'Editar meta' : 'Crear meta'}
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {loading ? (
        <p className="text-muted">Cargando...</p>
      ) : goal ? (
        <div className="detail-grid">
          <InfoRow label="Mes" value={`${MONTHS[month - 1]} ${year}`} />
          <InfoRow label="Meta de ingresos" value={formatCurrency(goal.revenueTarget)} />
          <InfoRow label="Meta de eventos" value={goal.eventCountTarget} />
          <InfoRow label="Ticket promedio objetivo" value={formatCurrency(goal.averageTicketTarget)} />
          <InfoRow label="Margen objetivo" value={goal.marginTarget != null ? `${goal.marginTarget}%` : '—'} />
          <InfoRow label="Umbral de preventa" value={`${goal.presaleThreshold}%`} />
        </div>
      ) : (
        <p className="text-muted">No hay meta definida para {MONTHS[month - 1]} {year}.</p>
      )}

      <Modal open={modal === 'new' || modal === 'edit'} title={modal === 'edit' ? 'Editar meta' : 'Nueva meta'} onClose={() => setModal(null)} size="sm">
        <GoalForm
          initial={goal}
          defaultYear={year}
          defaultMonth={month}
          onSaved={() => { setModal(null); load(); }}
          onCancel={() => setModal(null)}
        />
      </Modal>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value ?? '—'}</span>
    </div>
  );
}
