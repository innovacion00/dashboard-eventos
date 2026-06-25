import { useState, useEffect } from 'react';
import { quotesApi } from '../../lib/api/quotes.api.js';
import { companiesApi } from '../../lib/api/companies.api.js';
import { roomsApi } from '../../lib/api/rooms.api.js';
import { servicesApi } from '../../lib/api/services.api.js';
import { catalogsApi } from '../../lib/api/catalogs.api.js';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';
import { formatCurrency } from '../../lib/utils/format.js';

const CATEGORY_LABELS = { SALON: 'Salón', AB: 'A&B', AV: 'AV', OTROS: 'Otros', EXTERNO: 'Externo' };
const CATEGORY_KEYS = ['SALON', 'AB', 'AV', 'OTROS', 'EXTERNO'];

export function QuoteForm({ quoteId, onSaved, onCancel }) {
  const isEdit = Boolean(quoteId);

  const [form, setForm] = useState({
    opportunityId: '',
    companyId: '',
    eventDate: '',
    eventTime: '',
    validUntil: '',
    eventType: '',
    roomId: '',
    attendees: '',
    taxRate: 0.19,
    notes: '',
    internalNotes: '',
  });
  // { [serviceId]: { quantity, unitPrice, category } }
  const [selections, setSelections] = useState({});
  const [includeTip, setIncludeTip] = useState(false);
  const [tipRate, setTipRate] = useState(10);
  const [companies, setCompanies] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [services, setServices] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      companiesApi.list({ limit: 200 }),
      roomsApi.list(),
      servicesApi.list({ limit: 200 }),
      catalogsApi.list('EVENT_TYPE'),
    ]).then(([c, r, s, et]) => {
      setCompanies(c.data || []);
      setRooms(r.data || []);
      setServices(s.data || []);
      setEventTypes(et.data || []);
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
        const companyId = q.company?.id || q.company?._id || q.company || '';
        const oppId = q.opportunityId?.id || q.opportunityId?._id || q.opportunityId || '';
        const roomId = q.room?.id || q.room?._id || q.room || '';
        setForm({
          opportunityId: String(oppId),
          companyId: String(companyId),
          eventDate: q.eventDate ? q.eventDate.slice(0, 10) : '',
          eventTime: q.eventTime || '',
          validUntil: q.validUntil ? q.validUntil.slice(0, 10) : '',
          eventType: q.eventType || '',
          roomId: String(roomId),
          attendees: q.attendees || '',
          taxRate: q.taxRate ?? 0.19,
          notes: q.notes || '',
          internalNotes: q.internalNotes || '',
        });
        const newSel = {};
        (q.items || []).forEach(i => {
          const svcId = i.service?.id || i.service?._id || i.service;
          if (svcId) {
            newSel[String(svcId)] = { quantity: i.quantity, unitPrice: i.unitPrice, category: i.category };
          }
        });
        setSelections(newSel);
        const hasTip = (q.items || []).some(i => i.description === 'Propina' && i.category === 'AB');
        setIncludeTip(hasTip);
      }).catch(() => {});
    }
  }, [quoteId]);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const toggleService = (svc) => {
    const svcId = String(svc._id || svc.id);
    setSelections(prev => {
      if (prev[svcId]) {
        const next = { ...prev };
        delete next[svcId];
        return next;
      }
      return { ...prev, [svcId]: { quantity: 1, unitPrice: svc.unitPrice, category: svc.category } };
    });
  };

  const updateSel = (svcId, field, value) =>
    setSelections(prev => ({ ...prev, [svcId]: { ...prev[svcId], [field]: value } }));

  const servicesByCategory = services.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  const getItems = () => {
    const baseItems = services
      .filter(s => selections[String(s._id || s.id)])
      .map(s => {
        const svcId = String(s._id || s.id);
        const sel = selections[svcId];
        return {
          description: s.name,
          category: s.category,
          serviceId: svcId,
          quantity: Number(sel.quantity) || 1,
          unitPrice: Number(sel.unitPrice) || 0,
        };
      });

    if (includeTip && tipRate > 0) {
      const abTotal = baseItems.filter(i => i.category === 'AB').reduce((s, i) => s + i.quantity * i.unitPrice, 0);
      const tipAmount = Math.round(abTotal * (tipRate / 100));
      if (tipAmount > 0) {
        baseItems.push({ description: 'Propina', category: 'AB', quantity: 1, unitPrice: tipAmount });
      }
    }

    return baseItems;
  };

  const items = getItems();
  const subtotal  = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const icoBase   = items.filter(i => i.category === 'AB').reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const ivaBase   = subtotal - icoBase;
  const ivaAmount = Math.round(ivaBase * (Number(form.taxRate) || 0.19) * 100) / 100;
  const icoAmount = Math.round(icoBase * 0.08 * 100) / 100;
  const taxAmount = ivaAmount + icoAmount;
  const total     = subtotal + taxAmount;

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
        items,
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
            {opportunities.map(o => <option key={o._id || o.id} value={o._id || o.id}>{o.name || o.eventType || String(o._id || o.id)}</option>)}
          </select>
        </div>
        <div className="input-field">
          <label className="input-label">Fecha del evento</label>
          <input className="input-control" type="date" value={form.eventDate} onChange={e => set('eventDate', e.target.value)} />
        </div>
        <div className="input-field">
          <label className="input-label">Hora del evento</label>
          <input className="input-control" type="time" value={form.eventTime} onChange={e => set('eventTime', e.target.value)} />
        </div>
        <div className="input-field">
          <label className="input-label">Válida hasta</label>
          <input className="input-control" type="date" value={form.validUntil} onChange={e => set('validUntil', e.target.value)} />
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

      <div style={{ margin: 'var(--space-5) 0 var(--space-3)' }}>
        <strong style={{ fontSize: 'var(--text-sm)', display: 'block', marginBottom: 'var(--space-4)' }}>
          Ítems de la cotización
        </strong>

        {CATEGORY_KEYS.map(cat => {
          const catServices = servicesByCategory[cat] || [];
          if (catServices.length === 0) return null;

          return (
            <div key={cat} style={{
              marginBottom: 'var(--space-4)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: 'var(--space-2) var(--space-4)',
                background: 'var(--color-gray-1)',
                fontWeight: 'var(--font-semibold)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-gold-dark)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderBottom: '1px solid var(--color-border)',
              }}>
                {CATEGORY_LABELS[cat]}
              </div>

              <div style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                {catServices.map(svc => {
                  const svcId = String(svc._id || svc.id);
                  const sel = selections[svcId];
                  const isChecked = Boolean(sel);

                  return (
                    <div key={svcId}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        cursor: 'pointer',
                        padding: 'var(--space-2) var(--space-3)',
                        borderRadius: 'var(--radius-sm)',
                        background: isChecked ? 'var(--color-gold-subtle)' : 'transparent',
                        border: `1px solid ${isChecked ? 'var(--color-gold-dark)' : 'transparent'}`,
                        transition: 'background 0.15s',
                      }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleService(svc)}
                          style={{ accentColor: 'var(--color-gold-dark)', width: 16, height: 16, flexShrink: 0, cursor: 'pointer' }}
                        />
                        <span style={{ flex: 1, fontSize: 'var(--text-sm)' }}>{svc.name}</span>
                        {svc.description && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginRight: 'var(--space-2)' }}>
                            {svc.description}
                          </span>
                        )}
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', fontWeight: 'var(--font-medium)' }}>
                          {formatCurrency(svc.unitPrice)} / {svc.unit || 'unidad'}
                        </span>
                      </label>

                      {isChecked && (
                        <div style={{
                          display: 'flex',
                          gap: 'var(--space-3)',
                          alignItems: 'flex-end',
                          flexWrap: 'wrap',
                          padding: 'var(--space-2) var(--space-3) var(--space-3) calc(var(--space-3) + 28px)',
                        }}>
                          <div className="input-field" style={{ marginBottom: 0, minWidth: 100 }}>
                            <label className="input-label">Cantidad</label>
                            <input className="input-control" type="number" min="1"
                              value={sel.quantity}
                              onChange={e => updateSel(svcId, 'quantity', e.target.value)} />
                          </div>
                          <div className="input-field" style={{ marginBottom: 0, minWidth: 160 }}>
                            <label className="input-label">Precio unitario</label>
                            <input className="input-control" type="number" min="0" step="any"
                              value={sel.unitPrice}
                              onChange={e => updateSel(svcId, 'unitPrice', e.target.value)} />
                          </div>
                          <div style={{ paddingBottom: 'var(--space-1)', fontSize: 'var(--text-sm)', whiteSpace: 'nowrap' }}>
                            Subtotal: <strong>{formatCurrency((Number(sel.quantity) || 0) * (Number(sel.unitPrice) || 0))}</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
        padding: 'var(--space-3) var(--space-4)',
        borderRadius: 'var(--radius-sm)',
        background: includeTip ? 'var(--color-gold-subtle)' : 'var(--color-gray-1)',
        border: `1px solid ${includeTip ? 'var(--color-gold-dark)' : 'var(--color-border)'}`,
        marginBottom: 'var(--space-4)',
        transition: 'background 0.15s',
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={includeTip}
            onChange={(e) => setIncludeTip(e.target.checked)}
            style={{ accentColor: 'var(--color-gold-dark)', width: 16, height: 16, cursor: 'pointer' }}
          />
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>Incluir propina</span>
        </label>
        {includeTip && (
          <>
            <input
              type="number" min="1" max="100" step="1"
              value={tipRate}
              onChange={(e) => setTipRate(Number(e.target.value) || 0)}
              style={{ width: 60, textAlign: 'center', padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: 'var(--text-sm)' }}
            />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>% del total A&B</span>
            {(() => {
              const abTotal = items.filter(i => i.category === 'AB' && i.description !== 'Propina').reduce((s, i) => s + i.quantity * i.unitPrice, 0);
              return abTotal > 0 ? (
                <span style={{ marginLeft: 'auto', fontSize: 'var(--text-sm)', color: 'var(--color-gold-dark)', fontWeight: 'var(--font-semibold)' }}>
                  {formatCurrency(Math.round(abTotal * (tipRate / 100)))}
                </span>
              ) : null;
            })()}
          </>
        )}
      </div>

      {items.length > 0 && (
        <div style={{ textAlign: 'right', marginBottom: 'var(--space-5)', fontSize: 'var(--text-sm)', lineHeight: 2 }}>
          <div>Subtotal: <strong>{formatCurrency(subtotal)}</strong></div>
          {includeTip && (() => {
            const tipItem = items.find(i => i.description === 'Propina');
            return tipItem ? <div>Propina ({tipRate}%): <strong>{formatCurrency(tipItem.unitPrice)}</strong></div> : null;
          })()}
          <div>IVA ({Math.round((form.taxRate || 0.19) * 100)}%): <strong>{formatCurrency(ivaAmount)}</strong></div>
          {icoAmount > 0 && <div>ICO (8%): <strong>{formatCurrency(icoAmount)}</strong></div>}
          <div style={{ fontSize: 'var(--text-base)' }}>
            <strong>Total: {formatCurrency(total)}</strong>
          </div>
        </div>
      )}

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
