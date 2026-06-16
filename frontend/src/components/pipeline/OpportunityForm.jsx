import { useState, useEffect } from 'react';
import { opportunitiesApi } from '../../lib/api/opportunities.api.js';
import { companiesApi } from '../../lib/api/companies.api.js';
import { catalogsApi } from '../../lib/api/catalogs.api.js';
import { roomsApi } from '../../lib/api/rooms.api.js';
import { Input } from '../ui/Input.jsx';
import { Select } from '../ui/Select.jsx';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';

const STAGE_OPTIONS = [
  { value: 'PROSPECTO_INICIAL', label: 'Prospecto inicial' },
  { value: 'CALIFICADO', label: 'Calificado' },
  { value: 'VISITA_INSPECCION', label: 'Visita / Inspección' },
  { value: 'COTIZADO', label: 'Cotizado' },
  { value: 'NEGOCIACION', label: 'Negociación' },
  { value: 'APROBADO_PENDIENTE_PAGO', label: 'Aprobado, pendiente pago' },
  { value: 'CONFIRMADO', label: 'Confirmado' },
  { value: 'PERDIDO', label: 'Perdido' },
];

export function OpportunityForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState({
    companyId: initial?.company?._id || initial?.company?.id || '',
    eventType: initial?.eventType || '',
    segment: initial?.segment || '',
    estimatedValue: initial?.estimatedValue || '',
    projectionMonth: initial?.projectionMonth || '',
    attendees: initial?.attendees || '',
    estimatedEventDate: initial?.estimatedEventDate ? initial.estimatedEventDate.slice(0, 10) : '',
    nextActionAt: initial?.nextActionAt ? initial.nextActionAt.slice(0, 10) : '',
    nextActionDescription: initial?.nextActionDescription || '',
    notes: initial?.notes || '',
  });
  const [companies, setCompanies] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      companiesApi.list({ limit: 100 }),
      catalogsApi.list('EVENT_TYPE'),
      roomsApi.list(),
    ]).then(([co, ev, ro]) => {
      setCompanies((co.data || []).map((c) => ({ value: c.id, label: c.name })));
      setEventTypes((ev.data || []).map((c) => ({ value: c.code, label: c.label })));
      setRooms((ro.data || []).map((r) => ({ value: r._id, label: r.name })));
    }).catch(() => {});
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const err = {};
    if (!form.companyId) err.companyId = 'La empresa es obligatoria';
    if (!form.eventType) err.eventType = 'El tipo de evento es obligatorio';
    if (!form.estimatedValue) err.estimatedValue = 'El valor estimado es obligatorio';
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
        companyId: form.companyId,
        eventType: form.eventType,
        segment: form.segment || undefined,
        estimatedValue: Number(form.estimatedValue),
        projectionMonth: form.projectionMonth || undefined,
        attendees: form.attendees ? Number(form.attendees) : undefined,
        estimatedEventDate: form.estimatedEventDate ? new Date(form.estimatedEventDate).toISOString() : undefined,
        nextActionAt: form.nextActionAt ? new Date(form.nextActionAt).toISOString() : undefined,
        nextActionDescription: form.nextActionDescription || undefined,
        notes: form.notes || undefined,
      };
      if (initial) {
        await opportunitiesApi.update(initial.id, payload);
      } else {
        await opportunitiesApi.create(payload);
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
        <Select id="companyId" label="Empresa" value={form.companyId} onChange={set('companyId')} options={companies} placeholder="Selecciona empresa" error={errors.companyId} required />
        <Select id="eventType" label="Tipo de evento" value={form.eventType} onChange={set('eventType')} options={eventTypes} placeholder="Selecciona tipo" error={errors.eventType} required />
        <Input id="estimatedValue" label="Valor estimado (COP)" type="number" value={form.estimatedValue} onChange={set('estimatedValue')} error={errors.estimatedValue} required />
        <Input id="projectionMonth" label="Mes de proyección (YYYY-MM)" placeholder="2025-07" value={form.projectionMonth} onChange={set('projectionMonth')} />
        <Input id="attendees" label="N.° de asistentes" type="number" value={form.attendees} onChange={set('attendees')} />
        <Input id="estimatedEventDate" label="Fecha estimada del evento" type="date" value={form.estimatedEventDate} onChange={set('estimatedEventDate')} />
        <Input id="nextActionAt" label="Fecha próxima acción" type="date" value={form.nextActionAt} onChange={set('nextActionAt')} />
        <Input id="nextActionDescription" label="Descripción próxima acción" value={form.nextActionDescription} onChange={set('nextActionDescription')} />
      </div>
      <div className="input-field" style={{ marginTop: 'var(--space-3)' }}>
        <label className="input-label" htmlFor="notes">Notas</label>
        <textarea id="notes" className="input-control" rows={3} value={form.notes} onChange={set('notes')} />
      </div>
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>{initial ? 'Guardar cambios' : 'Crear oportunidad'}</Button>
      </div>
    </form>
  );
}
