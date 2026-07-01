import { useState, useEffect } from 'react';
import { quotesApi } from '../../lib/api/quotes.api.js';
import { companiesApi } from '../../lib/api/companies.api.js';
import { roomsApi } from '../../lib/api/rooms.api.js';
import { servicesApi } from '../../lib/api/services.api.js';
import { catalogsApi } from '../../lib/api/catalogs.api.js';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';
import { formatCurrency } from '../../lib/utils/format.js';
import { availabilityApi } from '../../lib/api/availability.api.js';

const CATEGORY_LABELS = { SALON: 'Salón', AB: 'A&B', AV: 'AV', OTROS: 'Otros', EXTERNO: 'Externo' };
const CATEGORY_KEYS = ['SALON', 'AB', 'AV', 'OTROS', 'EXTERNO'];

const ROOM_IMAGES = {
  '129033': { url: 'https://space-img.sfo3.digitaloceanspaces.com/Hoteles%20y%20habitaciones/habitaciones%20windsor/Doble%20estandar%20twin.jpg', name: 'Doble estándar twin' },
  '128299': { url: 'https://space-img.sfo3.digitaloceanspaces.com/Hoteles%20y%20habitaciones/habitaciones%20windsor/Doble%20Superior.jpg', name: 'Doble Superior' },
  '129035': { url: 'https://space-img.sfo3.digitaloceanspaces.com/Hoteles%20y%20habitaciones/habitaciones%20windsor/Doble%20Junior%20Suite.jpg', name: 'Doble Junior Suite' },
  '129036': { url: 'https://space-img.sfo3.digitaloceanspaces.com/Hoteles%20y%20habitaciones/habitaciones%20windsor/Doble%20Junior%20Twin.jpg', name: 'Doble Junior Twin' },
  '129037': { url: 'https://space-img.sfo3.digitaloceanspaces.com/Hoteles%20y%20habitaciones/habitaciones%20windsor/Suite%20Matrimonial.jpg', name: 'Suite Matrimonial' },
  '129034': { url: 'https://space-img.sfo3.digitaloceanspaces.com/Hoteles%20y%20habitaciones/habitaciones%20windsor/Triple%20Estandar%20altillo%20con%20escaleras.jpg', name: 'Triple Estándar altillo con escaleras' },
};

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
  const [collapsedCategories, setCollapsedCategories] = useState(
    Object.fromEntries(CATEGORY_KEYS.map(k => [k, true]))
  );
  const [showLodging, setShowLodging] = useState(false);
  const [lodging, setLodging] = useState({ checkIn: '', nights: '', adults: '', children: '' });
  const [lodgingResults, setLodgingResults] = useState(null);
  const [lodgingLoading, setLodgingLoading] = useState(false);
  const [lodgingError, setLodgingError] = useState('');
  const [lodgingSelections, setLodgingSelections] = useState({});
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
    if (!form.companyId) return;
    Promise.all([
      companiesApi.listOpportunities(form.companyId, { limit: 50 }),
      quotesApi.list({ companyId: form.companyId, limit: 200 }),
    ]).then(([oppRes, quotesRes]) => {
      const opps = oppRes.data || [];
      const quotes = quotesRes.data || [];
      // IDs de oportunidades que ya tienen cotización (excluir la actual en modo edición)
      const takenOppIds = new Set(
        quotes
          .filter(q => q.opportunityId && (!isEdit || q.id !== quoteId))
          .map(q => {
            const o = q.opportunityId;
            return typeof o === 'object' ? (o._id || o.id) : o;
          })
          .filter(Boolean)
          .map(String)
      );
      setOpportunities(opps.filter(o => !takenOppIds.has(String(o._id || o.id))));
    }).catch(() => {});
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

  const toggleCategory = (cat) =>
    setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));

  const handleCheckAvailability = async () => {
    if (!lodging.checkIn || !lodging.nights || !lodging.adults) {
      setLodgingError('Completa fecha de check in, noches y adultos.');
      return;
    }
    setLodgingLoading(true);
    setLodgingError('');
    setLodgingResults(null);
    try {
      const res = await availabilityApi.check({
        checkIn: lodging.checkIn,
        nights: lodging.nights,
        adults: lodging.adults,
        childrenAges: lodging.children || 0,
      });
      setLodgingResults(res.data);
      setLodgingSelections({});
    } catch (e) {
      setLodgingError(e.message || 'Error al consultar disponibilidad');
    } finally {
      setLodgingLoading(false);
    }
  };

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

    // Lodging items from Autocore availability
    if (lodgingResults) {
      lodgingResults.rooms.forEach(room => {
        const qty = lodgingSelections[room.roomId] || 0;
        if (qty > 0) {
          const img = ROOM_IMAGES[room.roomId];
          const roomLabel = img?.name || room.roomName;
          const nights = Number(lodging.nights) || 1;
          baseItems.push({
            description: `Hospedaje — ${roomLabel} (${nights} noche${nights > 1 ? 's' : ''})`,
            category: 'EXTERNO',
            quantity: qty,
            unitPrice: room.amountBeforeTax,
          });
        }
      });
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
        roomId: form.roomId || undefined,
        opportunityId: form.opportunityId || undefined,
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

          const isCollapsed = Boolean(collapsedCategories[cat]);
          const selectedCount = catServices.filter(svc => selections[String(svc._id || svc.id)]).length;

          return (
            <div key={cat} style={{
              marginBottom: 'var(--space-4)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}>
              <button
                type="button"
                onClick={() => toggleCategory(cat)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-2) var(--space-4)',
                  background: 'var(--color-gray-1)',
                  fontWeight: 'var(--font-semibold)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-gold-dark)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: isCollapsed ? 'none' : '1px solid var(--color-border)',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ display: 'inline-block', transition: 'transform 0.15s', transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
                  ▾
                </span>
                <span style={{ flex: 1 }}>{CATEGORY_LABELS[cat]}</span>
                {selectedCount > 0 && (
                  <span className="badge badge-success" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                    {selectedCount} seleccionado{selectedCount > 1 ? 's' : ''}
                  </span>
                )}
              </button>

              {!isCollapsed && (
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
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        marginBottom: 'var(--space-4)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}>
        <button
          type="button"
          onClick={() => setShowLodging(s => !s)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-4)',
            background: 'var(--color-gray-1)',
            fontWeight: 'var(--font-semibold)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-gold-dark)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: showLodging ? '1px solid var(--color-border)' : 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span style={{ display: 'inline-block', transition: 'transform 0.15s', transform: showLodging ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
            ▾
          </span>
          <span style={{ flex: 1 }}>Hospedaje</span>
        </button>

        {showLodging && (
          <div style={{ padding: 'var(--space-4)' }}>
            <div className="form-grid-2">
              <div className="input-field">
                <label className="input-label">Fecha de check in</label>
                <input className="input-control" type="date" value={lodging.checkIn}
                  onChange={e => setLodging(l => ({ ...l, checkIn: e.target.value }))} />
              </div>
              <div className="input-field">
                <label className="input-label">Número de noches</label>
                <input className="input-control" type="number" min="1" value={lodging.nights}
                  onChange={e => setLodging(l => ({ ...l, nights: e.target.value }))} />
              </div>
              <div className="input-field">
                <label className="input-label">Número de adultos</label>
                <input className="input-control" type="number" min="0" value={lodging.adults}
                  onChange={e => setLodging(l => ({ ...l, adults: e.target.value }))} />
              </div>
              <div className="input-field">
                <label className="input-label">Número de niños</label>
                <input className="input-control" type="number" min="0" value={lodging.children}
                  onChange={e => setLodging(l => ({ ...l, children: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <Button type="button" variant="secondary" loading={lodgingLoading} onClick={handleCheckAvailability}>
                Consultar
              </Button>
            </div>

            {lodgingError && (
              <p style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
                {lodgingError}
              </p>
            )}

            {lodgingResults && (
              <div style={{ marginTop: 'var(--space-4)' }}>
                {lodgingResults.rooms.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                    No hay habitaciones estándar disponibles para las fechas seleccionadas.
                  </p>
                ) : (
                  <>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                      {lodgingResults.rooms.length} habitación(es) estándar disponibles:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                      {lodgingResults.rooms.map((room, idx) => {
                        const img = ROOM_IMAGES[room.roomId];
                        const qty = lodgingSelections[room.roomId] || 0;
                        const isSelected = qty > 0;
                        const maxQty = room.count || 1;

                        const changeQty = (delta) => {
                          const next = Math.min(Math.max(qty + delta, 0), maxQty);
                          setLodgingSelections(prev => {
                            const updated = { ...prev };
                            if (next === 0) delete updated[room.roomId];
                            else updated[room.roomId] = next;
                            return updated;
                          });
                        };

                        return (
                          <div key={idx} style={{
                            display: 'flex',
                            gap: 'var(--space-3)',
                            alignItems: 'center',
                            background: isSelected ? 'var(--color-gold-subtle)' : 'var(--color-surface)',
                            border: `1px solid ${isSelected ? 'var(--color-gold-dark)' : 'var(--color-border)'}`,
                            borderRadius: 'var(--radius-md)',
                            overflow: 'hidden',
                            transition: 'background 0.15s, border-color 0.15s',
                          }}>
                            {img ? (
                              <img src={img.url} alt={img.name}
                                style={{ width: 110, height: 80, objectFit: 'cover', flexShrink: 0 }} />
                            ) : (
                              <div style={{ width: 110, height: 80, background: 'var(--color-gray-1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Sin imagen</span>
                              </div>
                            )}

                            <div style={{ flex: 1, padding: 'var(--space-2) 0' }}>
                              <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                                {img?.name || room.roomName}
                              </div>
                              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                                {room.boardTypeDescription}
                              </div>
                              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                                Disponibles: {maxQty}
                              </div>
                            </div>

                            <div style={{ textAlign: 'right', padding: 'var(--space-2) var(--space-3)', flexShrink: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--color-gold-dark)' }}>
                                {formatCurrency(room.amountBeforeTax)}
                              </div>
                              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                                antes de impuestos
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => changeQty(-1)} disabled={qty === 0}
                                  style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-white)', cursor: qty === 0 ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 16, opacity: qty === 0 ? 0.4 : 1 }}>
                                  −
                                </button>
                                <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                                  {qty}
                                </span>
                                <button type="button" onClick={() => changeQty(1)} disabled={qty >= maxQty}
                                  style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-white)', cursor: qty >= maxQty ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 16, opacity: qty >= maxQty ? 0.4 : 1 }}>
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
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
