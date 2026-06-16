import { useState } from 'react';
import { usersApi } from '../../lib/api/users.api.js';
import { Input } from '../ui/Input.jsx';
import { Select } from '../ui/Select.jsx';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';

const ROLE_OPTIONS = [
  { value: 'DIRECCION_GENERAL', label: 'Dirección General' },
  { value: 'GERENCIA_HOTEL', label: 'Gerencia Hotel' },
  { value: 'LIDER_COMERCIAL', label: 'Líder Comercial' },
  { value: 'EJECUTIVO_COMERCIAL', label: 'Ejecutivo Comercial' },
  { value: 'COORDINACION_OPERATIVA', label: 'Coord. Operativa' },
  { value: 'FINANCIERO', label: 'Financiero' },
  { value: 'CALIDAD', label: 'Calidad' },
  { value: 'ADMINISTRADOR', label: 'Administrador' },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVO', label: 'Activo' },
  { value: 'INACTIVO', label: 'Inactivo' },
  { value: 'SUSPENDIDO', label: 'Suspendido' },
];

export function UserForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    email: initial?.email || '',
    password: '',
    role: initial?.role || '',
    status: initial?.status || 'ACTIVO',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = 'El nombre es obligatorio';
    if (!form.email.trim()) err.email = 'El correo es obligatorio';
    if (!initial && !form.password) err.password = 'La contraseña es obligatoria';
    if (!form.role) err.role = 'El rol es obligatorio';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      setApiError('');
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (initial) {
        await usersApi.update(initial.id, payload);
      } else {
        await usersApi.create(payload);
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
      <Input id="name" label="Nombre completo" value={form.name} onChange={set('name')} error={errors.name} required />
      <Input id="email" label="Correo electrónico" type="email" value={form.email} onChange={set('email')} error={errors.email} required />
      <Input
        id="password"
        label={initial ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
        type="password"
        value={form.password}
        onChange={set('password')}
        error={errors.password}
        required={!initial}
      />
      <Select id="role" label="Rol" value={form.role} onChange={set('role')} options={ROLE_OPTIONS} placeholder="Selecciona un rol" error={errors.role} required />
      {initial && (
        <Select id="status" label="Estado" value={form.status} onChange={set('status')} options={STATUS_OPTIONS} />
      )}
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>{initial ? 'Guardar cambios' : 'Crear usuario'}</Button>
      </div>
    </form>
  );
}
