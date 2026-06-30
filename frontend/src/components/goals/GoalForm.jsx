import { useState, useEffect } from 'react';
import { goalsApi } from '../../lib/api/goals.api.js';
import { usersApi } from '../../lib/api/users.api.js';
import { Input } from '../ui/Input.jsx';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export function GoalForm({ initial, defaultYear, defaultMonth, onSaved, onCancel }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    year: initial?.year || defaultYear || new Date().getFullYear(),
    month: initial?.month || defaultMonth || new Date().getMonth() + 1,
    userId: initial?.user?.id || initial?.user?._id || '',
    revenueTarget: initial?.revenueTarget || '',
    eventCountTarget: initial?.eventCountTarget || '',
    averageTicketTarget: initial?.averageTicketTarget || '',
    marginTarget: initial?.marginTarget || '',
    presaleThreshold: initial?.presaleThreshold ?? 60,
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    usersApi.list({ limit: 100 }).then(res => {
      const all = res.data || [];
      const execs = all.filter(u =>
        u.role === 'EJECUTIVO_COMERCIAL' || u.role === 'LIDER_COMERCIAL'
      );
      setUsers(execs.length > 0 ? execs : all);
    }).catch((err) => {
      console.error('Error cargando usuarios para metas:', err);
    });
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const err = {};
    if (!form.revenueTarget) err.revenueTarget = 'La meta de ingresos es obligatoria';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      setApiError('');
      const payload = {
        year: Number(form.year),
        month: Number(form.month),
        revenueTarget: Number(form.revenueTarget),
        eventCountTarget: form.eventCountTarget ? Number(form.eventCountTarget) : undefined,
        averageTicketTarget: form.averageTicketTarget ? Number(form.averageTicketTarget) : undefined,
        marginTarget: form.marginTarget ? Number(form.marginTarget) : undefined,
        presaleThreshold: Number(form.presaleThreshold),
      };
      if (form.userId) payload.userId = form.userId;
      if (initial?.id || initial?._id) {
        await goalsApi.update(initial.id || initial._id, payload);
      } else {
        await goalsApi.create(payload);
      }
      onSaved();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {apiError && <Alert type="error" message={apiError} onClose={() => setApiError('')} />}
      <div className="form-grid-2">
        <div className="input-field">
          <label className="input-label">Mes <span className="input-required">*</span></label>
          <select className="input-control" value={form.month} onChange={set('month')} disabled={Boolean(initial)}>
            {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div className="input-field">
          <label className="input-label">Año <span className="input-required">*</span></label>
          <select className="input-control" value={form.year} onChange={set('year')} disabled={Boolean(initial)}>
            {[form.year - 1, form.year, form.year + 1].filter((y, i, arr) => arr.indexOf(y) === i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="input-field">
        <label className="input-label">Asignar a ejecutiva comercial</label>
        <select className="input-control" value={form.userId} onChange={set('userId')} disabled={Boolean(initial)}>
          <option value="">Meta general (sin asignar)</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>
      <Input id="revenueTarget" label="Meta de ingresos (COP)" type="number" value={form.revenueTarget} onChange={set('revenueTarget')} error={errors.revenueTarget} required />
      <Input id="eventCountTarget" label="Meta de eventos (unidades)" type="number" value={form.eventCountTarget} onChange={set('eventCountTarget')} />
      <Input id="averageTicketTarget" label="Ticket promedio objetivo (COP)" type="number" value={form.averageTicketTarget} onChange={set('averageTicketTarget')} />
      <Input id="marginTarget" label="Margen objetivo (%)" type="number" value={form.marginTarget} onChange={set('marginTarget')} />
      <Input id="presaleThreshold" label="Umbral de preventa (%)" type="number" value={form.presaleThreshold} onChange={set('presaleThreshold')} />
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>{initial ? 'Guardar cambios' : 'Crear meta'}</Button>
      </div>
    </form>
  );
}
