import { useState, useEffect } from 'react';
import { companiesApi } from '../../lib/api/companies.api.js';
import { Input } from '../ui/Input.jsx';
import { Select } from '../ui/Select.jsx';
import { SearchableSelect } from '../ui/SearchableSelect.jsx';
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
    segment: initial?.segment || '',
    status: initial?.status || 'PROSPECTO',
    contactName: initial?.contactName || '',
    contactPosition: initial?.contactPosition || '',
    phone: initial?.phone || '',
    email: initial?.email || '',
    address: initial?.address || '',
  });
  const [segments, setSegments] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    companiesApi.listSegments().then((res) => {
      setSegments((res.data || []).map((s) => ({ value: s, label: s })));
    }).catch(() => {});
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = 'El nombre es obligatorio';
    if (!form.segment) err.segment = 'El segmento es obligatorio';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = 'Correo inválido';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      setApiError('');
      if (initial) {
        await companiesApi.update(initial.id, form);
      } else {
        await companiesApi.create(form);
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
      <SearchableSelect
        id="segment"
        label="Segmento"
        value={form.segment}
        onChange={(val) => setForm(f => ({ ...f, segment: val }))}
        options={segments}
        placeholder="Selecciona un segmento"
        error={errors.segment}
        required
      />
      <Select id="status" label="Estado" value={form.status} onChange={set('status')} options={STATUS_OPTIONS} />
      <Input id="contactName" label="Contacto" value={form.contactName} onChange={set('contactName')} />
      <Input id="contactPosition" label="Cargo" value={form.contactPosition} onChange={set('contactPosition')} />
      <Input id="phone" label="Teléfono" value={form.phone} onChange={set('phone')} />
      <Input id="email" label="Correo" type="email" value={form.email} onChange={set('email')} error={errors.email} />
      <Input id="address" label="Dirección" value={form.address} onChange={set('address')} />
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>{initial ? 'Guardar cambios' : 'Crear empresa'}</Button>
      </div>
    </form>
  );
}
