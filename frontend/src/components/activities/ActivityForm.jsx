import { useState, useEffect } from 'react';
import { activitiesApi } from '../../lib/api/activities.api.js';
import { catalogsApi } from '../../lib/api/catalogs.api.js';
import { Input } from '../ui/Input.jsx';
import { Select } from '../ui/Select.jsx';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';

export function ActivityForm({ companyId, onSaved, onCancel }) {
  const [form, setForm] = useState({
    type: '', result: '', date: new Date().toISOString().slice(0, 16),
    nextActionDescription: '', nextActionAt: '',
  });
  const [types, setTypes] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    catalogsApi.list('ACTIVITY_TYPE').then((res) => {
      setTypes((res.data || []).map((c) => ({ value: c.code, label: c.label })));
    }).catch(() => {});
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const err = {};
    if (!form.type) err.type = 'El tipo es obligatorio';
    if (!form.result.trim()) err.result = 'El resultado es obligatorio';
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
        companyId,
        type: form.type,
        result: form.result,
        date: form.date ? new Date(form.date).toISOString() : undefined,
        nextActionDescription: form.nextActionDescription || undefined,
        nextActionAt: form.nextActionAt ? new Date(form.nextActionAt).toISOString() : undefined,
      };
      await activitiesApi.create(payload);
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
      <Select id="type" label="Tipo de actividad" value={form.type} onChange={set('type')} options={types} placeholder="Selecciona el tipo" error={errors.type} required />
      <Input id="date" label="Fecha y hora" type="datetime-local" value={form.date} onChange={set('date')} />
      <div className="input-field">
        <label className="input-label" htmlFor="result">Resultado <span className="input-required">*</span></label>
        <textarea id="result" className={`input-control ${errors.result ? 'input-control--error' : ''}`} rows={3} value={form.result} onChange={set('result')} />
        {errors.result && <span className="input-error" role="alert">{errors.result}</span>}
      </div>
      <Input id="nextActionDescription" label="Descripción próxima acción" value={form.nextActionDescription} onChange={set('nextActionDescription')} />
      <Input id="nextActionAt" label="Fecha próxima acción" type="datetime-local" value={form.nextActionAt} onChange={set('nextActionAt')} />
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>Registrar actividad</Button>
      </div>
    </form>
  );
}
