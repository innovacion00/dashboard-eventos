import { useState } from 'react';
import { contactsApi } from '../../lib/api/contacts.api.js';
import { Input } from '../ui/Input.jsx';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';

export function ContactForm({ companyId, onSaved, onCancel }) {
  const [form, setForm] = useState({ fullName: '', position: '', email: '', phone: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const err = {};
    if (!form.fullName.trim()) err.fullName = 'El nombre es obligatorio';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      setApiError('');
      await contactsApi.create({ ...form, companyId });
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
      <Input id="fullName" label="Nombre completo" value={form.fullName} onChange={set('fullName')} error={errors.fullName} required />
      <Input id="position" label="Cargo" value={form.position} onChange={set('position')} />
      <Input id="email" label="Correo" type="email" value={form.email} onChange={set('email')} />
      <Input id="phone" label="Teléfono" value={form.phone} onChange={set('phone')} />
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>Guardar contacto</Button>
      </div>
    </form>
  );
}
