import { useState, useEffect } from 'react';
import { companiesApi } from '../../lib/api/companies.api.js';
import { catalogsApi } from '../../lib/api/catalogs.api.js';
import { Input } from '../ui/Input.jsx';
import { Select } from '../ui/Select.jsx';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';

const STATUS_OPTIONS = [
  { value: 'PROSPECTO', label: 'Prospecto' },
  { value: 'CLIENTE_ACTIVO', label: 'Cliente activo' },
  { value: 'CLIENTE_INACTIVO', label: 'Cliente inactivo' },
  { value: 'ALIADO', label: 'Aliado' },
  { value: 'AGENCIA', label: 'Agencia' },
  { value: 'GUBERNAMENTAL', label: 'Gubernamental' },
];

export function CompanyForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    taxId: initial?.taxId || '',
    segment: initial?.segment || '',
    status: initial?.status || 'PROSPECTO',
    estimatedPotential: initial?.estimatedPotential || '',
    location: { city: initial?.location?.city || '', country: initial?.location?.country || '' },
    nextActionDescription: initial?.nextActionDescription || '',
  });
  const [segments, setSegments] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    catalogsApi.list('SEGMENT').then((res) => {
      setSegments((res.data || []).map((c) => ({ value: c.code, label: c.label })));
    }).catch(() => {});
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const setLocation = (field) => (e) => setForm((f) => ({ ...f, location: { ...f.location, [field]: e.target.value } }));

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = 'El nombre es obligatorio';
    if (!form.segment) err.segment = 'El segmento es obligatorio';
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
        ...form,
        estimatedPotential: form.estimatedPotential ? Number(form.estimatedPotential) : undefined,
      };
      if (initial) {
        await companiesApi.update(initial.id, payload);
      } else {
        await companiesApi.create(payload);
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
      <Input id="name" label="Nombre de la empresa" value={form.name} onChange={set('name')} error={errors.name} required />
      <Input id="taxId" label="NIT / RUT" value={form.taxId} onChange={set('taxId')} />
      <Select id="segment" label="Segmento" value={form.segment} onChange={set('segment')} options={segments} placeholder="Selecciona un segmento" error={errors.segment} required />
      <Select id="status" label="Estado comercial" value={form.status} onChange={set('status')} options={STATUS_OPTIONS} />
      <Input id="estimatedPotential" label="Potencial estimado (COP)" type="number" value={form.estimatedPotential} onChange={set('estimatedPotential')} />
      <Input id="city" label="Ciudad" value={form.location.city} onChange={setLocation('city')} />
      <Input id="country" label="País" value={form.location.country} onChange={setLocation('country')} />
      <Input id="nextActionDescription" label="Descripción próxima acción" value={form.nextActionDescription} onChange={set('nextActionDescription')} />
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>{initial ? 'Guardar cambios' : 'Crear empresa'}</Button>
      </div>
    </form>
  );
}
