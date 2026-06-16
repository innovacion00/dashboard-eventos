import { useState } from 'react';
import { tasksApi } from '../../lib/api/tasks.api.js';
import { Input } from '../ui/Input.jsx';
import { Select } from '../ui/Select.jsx';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';

const PRIORITY_OPTIONS = [
  { value: 'ALTA', label: 'Alta' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'BAJA', label: 'Baja' },
];

export function TaskForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    priority: initial?.priority || 'MEDIA',
    dueDate: initial?.dueDate ? initial.dueDate.slice(0, 10) : '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const err = {};
    if (!form.title.trim()) err.title = 'El título es obligatorio';
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
        title: form.title,
        description: form.description || undefined,
        priority: form.priority,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
      };
      if (initial) {
        await tasksApi.update(initial._id || initial.id, payload);
      } else {
        await tasksApi.create(payload);
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
      <Input id="title" label="Título" value={form.title} onChange={set('title')} error={errors.title} required />
      <div className="input-field">
        <label className="input-label" htmlFor="description">Descripción</label>
        <textarea id="description" className="input-control" rows={3} value={form.description} onChange={set('description')} />
      </div>
      <Select id="priority" label="Prioridad" value={form.priority} onChange={set('priority')} options={PRIORITY_OPTIONS} />
      <Input id="dueDate" label="Fecha de vencimiento" type="date" value={form.dueDate} onChange={set('dueDate')} />
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>{initial ? 'Guardar cambios' : 'Crear tarea'}</Button>
      </div>
    </form>
  );
}
