import { useState, useEffect } from 'react';
import { eventsApi } from '../../lib/api/events.api.js';
import { companiesApi } from '../../lib/api/companies.api.js';
import { roomsApi } from '../../lib/api/rooms.api.js';
import { catalogsApi } from '../../lib/api/catalogs.api.js';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';

const SETUP_TYPES = ['AUDITORIO', 'ESCUELA', 'U_SHAPE', 'COCTEL', 'BANQUETE'];
const SETUP_LABELS = { AUDITORIO: 'Auditorio', ESCUELA: 'Escuela', U_SHAPE: 'U-Shape', COCTEL: 'Coctel', BANQUETE: 'Banquete' };

export function EventForm({ eventId, onSaved, onCancel }) {
  const isEdit = Boolean(eventId);

  const [form, setForm] = useState({
    companyId: '', name: '', eventType: '', roomId: '',
    eventDate: '', startTime: '', endTime: '',
    attendees: '', setupType: '', totalValue: '', notes: '',
  });
  const [companies, setCompanies] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      companiesApi.list({ limit: 200 }),
      roomsApi.list(),
      catalogsApi.list('EVENT_TYPE'),
    ]).then(([c, r, et]) => {
      setCompanies(c.data || []);
      setRooms(r.data || []);
      setEventTypes(et.data || []);
    }).catch(() => {});

    if (isEdit) {
      eventsApi.getById(eventId).then(res => {
        const ev = res.data;
        setForm({
          companyId: ev.company?.id || '',
          name: ev.name || '',
          eventType: ev.eventType || '',
          roomId: ev.room?.id || '',
          eventDate: ev.eventDate ? ev.eventDate.slice(0, 10) : '',
          startTime: ev.startTime || '',
          endTime: ev.endTime || '',
          attendees: ev.attendees || '',
          setupType: ev.setupType || '',
          totalValue: ev.totalValue || '',
          notes: ev.notes || '',
        });
      }).catch(() => {});
    }
  }, [eventId]);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.companyId) { setError('Selecciona una empresa'); return; }
    if (!form.name || form.name.length < 2) { setError('El nombre debe tener al menos 2 caracteres'); return; }
    if (!form.eventDate) { setError('La fecha del evento es obligatoria'); return; }
    setLoading(true);
    setError('');
    try {
      const attendeesNum = form.attendees !== '' ? Number(form.attendees) : undefined;
      const totalValueNum = form.totalValue !== '' ? Number(form.totalValue) : undefined;
      const payload = {
        companyId: form.companyId,
        name: form.name,
        eventType: form.eventType || undefined,
        roomId: form.roomId || undefined,
        eventDate: new Date(form.eventDate).toISOString(),
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
        attendees: attendeesNum && attendeesNum > 0 ? attendeesNum : undefined,
        setupType: form.setupType || undefined,
        totalValue: totalValueNum !== undefined && totalValueNum >= 0 ? totalValueNum : undefined,
        notes: form.notes || undefined,
      };
      if (isEdit) {
        await eventsApi.update(eventId, payload);
      } else {
        await eventsApi.create(payload);
      }
      onSaved?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="form-grid-2">
        <div className="input-field">
          <label className="input-label">Empresa <span className="input-required">*</span></label>
          <select className="input-control" value={form.companyId} onChange={e => set('companyId', e.target.value)} required>
            <option value="">Seleccionar...</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="input-field">
          <label className="input-label">Nombre del evento <span className="input-required">*</span></label>
          <input className="input-control" value={form.name} onChange={e => set('name', e.target.value)} required />
        </div>
        <div className="input-field">
          <label className="input-label">Tipo de evento</label>
          <select className="input-control" value={form.eventType} onChange={e => set('eventType', e.target.value)}>
            <option value="">Sin tipo</option>
            {eventTypes.map(et => <option key={et.code} value={et.label}>{et.label}</option>)}
          </select>
        </div>
        <div className="input-field">
          <label className="input-label">Salón</label>
          <select className="input-control" value={form.roomId} onChange={e => set('roomId', e.target.value)}>
            <option value="">Sin salón</option>
            {rooms.map(r => <option key={String(r._id || r.id)} value={String(r._id || r.id)}>{r.name}</option>)}
          </select>
        </div>
        <div className="input-field">
          <label className="input-label">Fecha del evento <span className="input-required">*</span></label>
          <input className="input-control" type="date" value={form.eventDate} onChange={e => set('eventDate', e.target.value)} required />
        </div>
        <div className="input-field">
          <label className="input-label">Montaje</label>
          <select className="input-control" value={form.setupType} onChange={e => set('setupType', e.target.value)}>
            <option value="">Sin especificar</option>
            {SETUP_TYPES.map(s => <option key={s} value={s}>{SETUP_LABELS[s]}</option>)}
          </select>
        </div>
        <div className="input-field">
          <label className="input-label">Hora inicio</label>
          <input className="input-control" type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)} />
        </div>
        <div className="input-field">
          <label className="input-label">Hora fin</label>
          <input className="input-control" type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)} />
        </div>
        <div className="input-field">
          <label className="input-label">Asistentes</label>
          <input className="input-control" type="number" min="1" value={form.attendees} onChange={e => set('attendees', e.target.value)} />
        </div>
        <div className="input-field">
          <label className="input-label">Valor total</label>
          <input className="input-control" type="number" min="0" step="any" value={form.totalValue} onChange={e => set('totalValue', e.target.value)} />
        </div>
      </div>

      <div className="input-field">
        <label className="input-label">Notas</label>
        <textarea className="input-control" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} />
      </div>

      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear evento'}</Button>
      </div>
    </form>
  );
}
