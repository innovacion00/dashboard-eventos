import { useState, useEffect } from 'react';
import { quotesApi } from '../../lib/api/quotes.api.js';
import { companiesApi } from '../../lib/api/companies.api.js';
import { opportunitiesApi } from '../../lib/api/opportunities.api.js';
import { roomsApi } from '../../lib/api/rooms.api.js';
import { servicesApi } from '../../lib/api/services.api.js';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';
import { formatCurrency } from '../../lib/utils/format.js';

const ITEM_CATEGORIES = ['SALON', 'AB', 'AV', 'OTROS'];
const EMPTY_ITEM = { description: '', category: 'OTROS', serviceId: '', quantity: 1, unitPrice: 0 };

export function QuoteForm({ quoteId, onSaved, onCancel }) {
  const isEdit = Boolean(quoteId);

  const [form, setForm] = useState({
    opportunityId: '',
    companyId: '',
    eventDate: '',
    validUntil: '',
    eventType: '',
    roomId: '',
    attendees: '',
    taxRate: 0.19,
    notes: '',
    internalNotes: '',
    items: [],
  });
  const [companies, setCompanies] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      companiesApi.list({ limit: 200 }),
      roomsApi.list(),
      servicesApi.list({ limit: 200 }),
    ]).then(([c, r, s]) => {
      setCompanies(c.data || []);
      setRooms(r.data || []);
      setServices(s.data || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.companyId) {
      companiesApi.listOpportunities(form.companyId, { limit: 50 })
        .then(res => setOpportunities(res.data || []))
        .catch(() => {});
    }
  }, [form.companyId]);

  useEffect(() => {
    if (isEdit) {
      quotesApi.getById(quoteId).then(res => {
        const q = res.data;
        setForm({
          opportunityId: q.opportunityId || '',
          companyId: q.company?.id || '',
          eventDate: q.eventDate ? q.eventDate.slice(0, 10) : '',
          validUntil: q.validUntil ? q.validUntil.slice(0, 10) : '',
          eventType: q.eventType || '',
          roomId: q.room?.id || '',
          attendees: q.attendees || '',
          taxRate: q.taxRate ?? 0.19,
          notes: q.notes || '',
          internalNotes: q.internalNotes || '',
          items: q.items.map(i => ({
            description: i.description,
            category: i.category,
            serviceId: i.service?.id || '',
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        });
      }).catch(() => {});
    }
  }, [quoteId]);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const setItem = (idx, field, value) => {
    setForm(f => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...f, items };
    });
  };

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));
  const removeItem = (idx) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const subtotal = form.items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0);
  const taxAmount = subtotal * (Number(form.taxRate) || 0);
  const total = subtotal + taxAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        attendees: form.attendees ? Number(form.attendees) : undefined,
        eventDate: form.eventDate ? new Date(form.eventDate).toISOString() : undefined,
        validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : undefined,
        items: form.items.map(i => ({
          description: i.description,
          category: i.category,
          serviceId: i.serviceId || undefined,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
        })),
      };
      if (isEdit) {
        await quotesApi.update(quoteId, payload);
      } else {
        await quotesApi.create(payload);
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
          <label className="input-label">Oportunidad</label>
          <select className="input-control" value={form.opportunityId} onChange={e => set('opportunityId', e.target.value)}>
            <option value="">Ninguna</option>
            {opportunities.map(o => <option key={o._id || o.id} value={o._id || o.id}>{o.eventType || o._id}</option>)}
          </select>
        </div>
        <div className="input-field">
          <label className="input-label">Fecha del evento</label>
          <input className="input-control" type="date" value={form.eventDate} onChange={e => set('eventDate', e.target.value)} />
        </div>
        <div className="input-field">
          <label className="input-label">Válida hasta</label>
          <input className="input-control" type="date" value={form.validUntil} onChange={e => set('validUntil', e.target.value)} />
        </div>
        <div className="input-field">
          <label className="input-label">Tipo de evento</label>
          <input className="input-control" value={form.eventType} onChange={e => set('eventType', e.target.value)} />
        </div>
        <div className="input-field">
          <label className="input-label">Salón</label>
          <select className="input-control" value={form.roomId} onChange={e => set('roomId', e.target.value)}>
            <option value="">Sin salón</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div className="input-field">
          <label className="input-label">Asistentes</label>
          <input className="input-control" type="number" min="1" value={form.attendees} onChange={e => set('attendees', e.target.value)} />
        </div>
        <div className="input-field">
          <label className="input-label">IVA (%)</label>
          <input className="input-control" type="number" min="0" max="100" step="1"
            value={Math.round(form.taxRate * 100)}
            onChange={e => set('taxRate', Number(e.target.value) / 100)} />
        </div>
      </div>

      {/* Líneas */}
      <div style={{ margin: 'var(--space-5) 0 var(--space-3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
          <strong style={{ fontSize: 'var(--text-sm)' }}>Ítems de la cotización</strong>
          <Button type="button" variant="secondary" onClick={addItem}>+ Agregar ítem</Button>
        </div>

        {form.items.length === 0 && (
          <p className="text-muted" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
            No hay ítems. Haz clic en "Agregar ítem".
          </p>
        )}

        {form.items.map((item, idx) => (
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 'var(--space-2)', alignItems: 'end', marginBottom: 'var(--space-2)' }}>
            <div className="input-field" style={{ marginBottom: 0 }}>
              {idx === 0 && <label className="input-label">Descripción</label>}
              <input className="input-control" placeholder="Descripción" value={item.description}
                onChange={e => setItem(idx, 'description', e.target.value)} required />
            </div>
            <div className="input-field" style={{ marginBottom: 0 }}>
              {idx === 0 && <label className="input-label">Categoría</label>}
              <select className="input-control" value={item.category} onChange={e => setItem(idx, 'category', e.target.value)}>
                {ITEM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="input-field" style={{ marginBottom: 0 }}>
              {idx === 0 && <label className="input-label">Cantidad</label>}
              <input className="input-control" type="number" min="1" value={item.quantity}
                onChange={e => setItem(idx, 'quantity', e.target.value)} />
            </div>
            <div className="input-field" style={{ marginBottom: 0 }}>
              {idx === 0 && <label className="input-label">Precio unit.</label>}
              <input className="input-control" type="number" min="0" step="1000" value={item.unitPrice}
                onChange={e => setItem(idx, 'unitPrice', e.target.value)} />
            </div>
            <button type="button" className="link-btn link-btn--danger"
              style={{ marginBottom: 'var(--space-1)', paddingBottom: 'var(--space-2)' }}
              onClick={() => removeItem(idx)}>✕</button>
          </div>
        ))}

        {form.items.length > 0 && (
          <div style={{ textAlign: 'right', marginTop: 'var(--space-4)', fontSize: 'var(--text-sm)', lineHeight: 2 }}>
            <div>Subtotal: <strong>{formatCurrency(subtotal)}</strong></div>
            <div>IVA ({Math.round(form.taxRate * 100)}%): <strong>{formatCurrency(taxAmount)}</strong></div>
            <div style={{ fontSize: 'var(--text-base)' }}>
              <strong>Total: {formatCurrency(total)}</strong>
            </div>
          </div>
        )}
      </div>

      <div className="input-field">
        <label className="input-label">Notas para el cliente</label>
        <textarea className="input-control" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} />
      </div>
      <div className="input-field">
        <label className="input-label">Notas internas</label>
        <textarea className="input-control" rows={2} value={form.internalNotes} onChange={e => set('internalNotes', e.target.value)} />
      </div>

      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear cotización'}</Button>
      </div>
    </form>
  );
}
