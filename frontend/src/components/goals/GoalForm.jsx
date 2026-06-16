import { useState } from 'react';
import { goalsApi } from '../../lib/api/goals.api.js';
import { Input } from '../ui/Input.jsx';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';

export function GoalForm({ initial, defaultYear, defaultMonth, onSaved, onCancel }) {
  const [form, setForm] = useState({
    year: initial?.year || defaultYear || new Date().getFullYear(),
    month: initial?.month || defaultMonth || new Date().getMonth() + 1,
    revenueTarget: initial?.revenueTarget || '',
    eventCountTarget: initial?.eventCountTarget || '',
    averageTicketTarget: initial?.averageTicketTarget || '',
    marginTarget: initial?.marginTarget || '',
    presaleThreshold: initial?.presaleThreshold ?? 60,
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

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
      if (initial?._id || initial?.id) {
        await goalsApi.update(initial._id || initial.id, payload);
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
