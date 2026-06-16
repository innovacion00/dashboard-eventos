import { useState, useEffect } from 'react';
import { beosApi } from '../../lib/api/beos.api.js';
import { servicesApi } from '../../lib/api/services.api.js';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';

const BEO_STATUS_LABELS = { BORRADOR: 'Borrador', EMITIDO: 'Emitido', CONFIRMADO: 'Confirmado' };
const BEO_STATUS_VARIANT = { BORRADOR: 'neutral', EMITIDO: 'warning', CONFIRMADO: 'success' };

const SETUP_TYPES = [
  { value: 'AUDITORIO', label: 'Auditorio' },
  { value: 'ESCUELA', label: 'Escuela' },
  { value: 'U_SHAPE', label: 'U-Shape' },
  { value: 'COCTEL', label: 'Coctel' },
  { value: 'BANQUETE', label: 'Banquete' },
];

const EMPTY_MENU = { time: '', description: '', serviceId: '', quantity: 1, notes: '' };
const EMPTY_AV = { description: '', serviceId: '', quantity: 1, notes: '' };
const EMPTY_PERSONNEL = { role: '', quantity: 1, notes: '' };
const EMPTY_SUPPLIER = { name: '', service: '', contact: '', notes: '' };

export function BeoPanel({ eventId }) {
  const [beo, setBeo] = useState(null);
  const [services, setServices] = useState([]);
  const [tab, setTab] = useState('setup');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const [beoRes, svcRes] = await Promise.all([
        beosApi.getByEvent(eventId),
        servicesApi.list({ limit: 200 }),
      ]);
      setBeo(beoRes.data);
      setServices(svcRes.data || []);
      if (beoRes.data) setDraft(cloneBeo(beoRes.data));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [eventId]);

  function cloneBeo(b) {
    return {
      setup: { type: b.setup?.type || '', chairs: b.setup?.chairs || '', tables: b.setup?.tables || '', notes: b.setup?.notes || '', readyAt: b.setup?.readyAt ? b.setup.readyAt.slice(0, 16) : '' },
      menu: (b.menu || []).map(m => ({ time: m.time || '', description: m.description, serviceId: m.serviceId?.id || '', quantity: m.quantity || 1, notes: m.notes || '' })),
      audiovisual: (b.audiovisual || []).map(a => ({ description: a.description, serviceId: a.serviceId?.id || '', quantity: a.quantity || 1, notes: a.notes || '' })),
      personnel: (b.personnel || []).map(p => ({ role: p.role, quantity: p.quantity || 1, notes: p.notes || '' })),
      suppliers: (b.suppliers || []).map(s => ({ name: s.name, service: s.service || '', contact: s.contact || '', notes: s.notes || '' })),
      generalNotes: b.generalNotes || '',
    };
  }

  const handleCreate = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await beosApi.create({ eventId, menu: [], audiovisual: [], personnel: [], suppliers: [] });
      setBeo(res.data);
      setDraft(cloneBeo(res.data));
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        setup: {
          ...draft.setup,
          chairs: draft.setup.chairs ? Number(draft.setup.chairs) : undefined,
          tables: draft.setup.tables ? Number(draft.setup.tables) : undefined,
          readyAt: draft.setup.readyAt ? new Date(draft.setup.readyAt).toISOString() : undefined,
        },
        menu: draft.menu.map(m => ({ ...m, serviceId: m.serviceId || undefined, quantity: Number(m.quantity) })),
        audiovisual: draft.audiovisual.map(a => ({ ...a, serviceId: a.serviceId || undefined, quantity: Number(a.quantity) })),
        personnel: draft.personnel.map(p => ({ ...p, quantity: Number(p.quantity) })),
        suppliers: draft.suppliers,
        generalNotes: draft.generalNotes,
      };
      const res = await beosApi.update(beo.id, payload);
      setBeo(res.data);
      setDraft(cloneBeo(res.data));
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (status) => {
    setSaving(true);
    setError('');
    try {
      const res = await beosApi.changeStatus(beo.id, status);
      setBeo(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const setSetup = (field, value) => setDraft(d => ({ ...d, setup: { ...d.setup, [field]: value } }));
  const setList = (list, setter) => setDraft(d => ({ ...d, [list]: setter(d[list]) }));

  const addItem = (list, empty) => setList(list, items => [...items, { ...empty }]);
  const removeItem = (list, idx) => setList(list, items => items.filter((_, i) => i !== idx));
  const setItem = (list, idx, field, value) => setList(list, items => {
    const next = [...items];
    next[idx] = { ...next[idx], [field]: value };
    return next;
  });

  const abServices = services.filter(s => s.category === 'AB');
  const avServices = services.filter(s => s.category === 'AV');

  if (loading) return <p className="page-loading">Cargando BEO...</p>;

  if (!beo) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        <p className="text-muted" style={{ marginBottom: 'var(--space-4)' }}>
          Este evento aún no tiene una Orden Operativa (BEO).
        </p>
        <Button onClick={handleCreate} disabled={saving}>
          {saving ? 'Creando...' : 'Crear BEO'}
        </Button>
      </div>
    );
  }

  const isLocked = beo.status === 'CONFIRMADO';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)' }}>{beo.number}</span>
          <span className={`badge badge-${BEO_STATUS_VARIANT[beo.status]}`}>{BEO_STATUS_LABELS[beo.status]}</span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {!isLocked && (
            <>
              <Button variant="secondary" onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
              {beo.status === 'BORRADOR' && <Button onClick={() => handleStatusChange('EMITIDO')} disabled={saving}>Emitir</Button>}
              {beo.status === 'EMITIDO' && <Button onClick={() => handleStatusChange('CONFIRMADO')} disabled={saving}>Confirmar</Button>}
            </>
          )}
        </div>
      </div>

      <div className="tabs">
        {[['setup', 'Montaje'], ['menu', 'A&B'], ['audiovisual', 'AV'], ['personnel', 'Personal'], ['suppliers', 'Proveedores'], ['notes', 'Notas']].map(([t, l]) => (
          <button key={t} className={`tab-btn ${tab === t ? 'tab-btn--active' : ''}`} onClick={() => setTab(t)}>{l}</button>
        ))}
      </div>

      {tab === 'setup' && draft && (
        <div className="form-grid-2">
          <div className="input-field">
            <label className="input-label">Tipo de montaje</label>
            <select className="input-control" value={draft.setup.type} onChange={e => setSetup('type', e.target.value)} disabled={isLocked}>
              <option value="">Sin especificar</option>
              {SETUP_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="input-field">
            <label className="input-label">Montaje listo a las</label>
            <input className="input-control" type="datetime-local" value={draft.setup.readyAt} onChange={e => setSetup('readyAt', e.target.value)} disabled={isLocked} />
          </div>
          <div className="input-field">
            <label className="input-label">Sillas</label>
            <input className="input-control" type="number" min="0" value={draft.setup.chairs} onChange={e => setSetup('chairs', e.target.value)} disabled={isLocked} />
          </div>
          <div className="input-field">
            <label className="input-label">Mesas</label>
            <input className="input-control" type="number" min="0" value={draft.setup.tables} onChange={e => setSetup('tables', e.target.value)} disabled={isLocked} />
          </div>
          <div className="input-field" style={{ gridColumn: '1/-1' }}>
            <label className="input-label">Notas de montaje</label>
            <textarea className="input-control" rows={3} value={draft.setup.notes} onChange={e => setSetup('notes', e.target.value)} disabled={isLocked} />
          </div>
        </div>
      )}

      {tab === 'menu' && draft && (
        <BeoItemList
          items={draft.menu}
          isLocked={isLocked}
          onAdd={() => addItem('menu', EMPTY_MENU)}
          onRemove={idx => removeItem('menu', idx)}
          onSet={(idx, f, v) => setItem('menu', idx, f, v)}
          services={abServices}
          showTime
          emptyText="Sin ítems de A&B"
        />
      )}

      {tab === 'audiovisual' && draft && (
        <BeoItemList
          items={draft.audiovisual}
          isLocked={isLocked}
          onAdd={() => addItem('audiovisual', EMPTY_AV)}
          onRemove={idx => removeItem('audiovisual', idx)}
          onSet={(idx, f, v) => setItem('audiovisual', idx, f, v)}
          services={avServices}
          emptyText="Sin equipos AV"
        />
      )}

      {tab === 'personnel' && draft && (
        <div>
          {!isLocked && <Button variant="secondary" onClick={() => addItem('personnel', EMPTY_PERSONNEL)} style={{ marginBottom: 'var(--space-3)' }}>+ Agregar personal</Button>}
          {draft.personnel.length === 0 && <p className="text-muted">Sin personal asignado.</p>}
          {draft.personnel.map((p, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr auto', gap: 'var(--space-2)', alignItems: 'end', marginBottom: 'var(--space-2)' }}>
              <div className="input-field" style={{ marginBottom: 0 }}>
                {idx === 0 && <label className="input-label">Rol</label>}
                <input className="input-control" value={p.role} onChange={e => setItem('personnel', idx, 'role', e.target.value)} disabled={isLocked} placeholder="Ej: Mesero" />
              </div>
              <div className="input-field" style={{ marginBottom: 0 }}>
                {idx === 0 && <label className="input-label">Cantidad</label>}
                <input className="input-control" type="number" min="1" value={p.quantity} onChange={e => setItem('personnel', idx, 'quantity', e.target.value)} disabled={isLocked} />
              </div>
              <div className="input-field" style={{ marginBottom: 0 }}>
                {idx === 0 && <label className="input-label">Notas</label>}
                <input className="input-control" value={p.notes} onChange={e => setItem('personnel', idx, 'notes', e.target.value)} disabled={isLocked} />
              </div>
              {!isLocked && <button type="button" className="link-btn link-btn--danger" style={{ paddingBottom: 'var(--space-2)' }} onClick={() => removeItem('personnel', idx)}>✕</button>}
            </div>
          ))}
        </div>
      )}

      {tab === 'suppliers' && draft && (
        <div>
          {!isLocked && <Button variant="secondary" onClick={() => addItem('suppliers', EMPTY_SUPPLIER)} style={{ marginBottom: 'var(--space-3)' }}>+ Agregar proveedor</Button>}
          {draft.suppliers.length === 0 && <p className="text-muted">Sin proveedores externos.</p>}
          {draft.suppliers.map((s, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr auto', gap: 'var(--space-2)', alignItems: 'end', marginBottom: 'var(--space-2)' }}>
              <div className="input-field" style={{ marginBottom: 0 }}>
                {idx === 0 && <label className="input-label">Proveedor</label>}
                <input className="input-control" value={s.name} onChange={e => setItem('suppliers', idx, 'name', e.target.value)} disabled={isLocked} />
              </div>
              <div className="input-field" style={{ marginBottom: 0 }}>
                {idx === 0 && <label className="input-label">Servicio</label>}
                <input className="input-control" value={s.service} onChange={e => setItem('suppliers', idx, 'service', e.target.value)} disabled={isLocked} />
              </div>
              <div className="input-field" style={{ marginBottom: 0 }}>
                {idx === 0 && <label className="input-label">Contacto</label>}
                <input className="input-control" value={s.contact} onChange={e => setItem('suppliers', idx, 'contact', e.target.value)} disabled={isLocked} />
              </div>
              {!isLocked && <button type="button" className="link-btn link-btn--danger" style={{ paddingBottom: 'var(--space-2)' }} onClick={() => removeItem('suppliers', idx)}>✕</button>}
            </div>
          ))}
        </div>
      )}

      {tab === 'notes' && draft && (
        <div className="input-field">
          <label className="input-label">Notas generales del BEO</label>
          <textarea className="input-control" rows={8} value={draft.generalNotes} onChange={e => setDraft(d => ({ ...d, generalNotes: e.target.value }))} disabled={isLocked} />
        </div>
      )}
    </div>
  );
}

function BeoItemList({ items, isLocked, onAdd, onRemove, onSet, services, showTime, emptyText }) {
  return (
    <div>
      {!isLocked && <Button variant="secondary" onClick={onAdd} style={{ marginBottom: 'var(--space-3)' }}>+ Agregar ítem</Button>}
      {items.length === 0 && <p className="text-muted">{emptyText}</p>}
      {items.map((item, idx) => (
        <div key={idx} style={{ display: 'grid', gridTemplateColumns: showTime ? '80px 2fr 2fr 60px auto' : '2fr 2fr 60px auto', gap: 'var(--space-2)', alignItems: 'end', marginBottom: 'var(--space-2)' }}>
          {showTime && (
            <div className="input-field" style={{ marginBottom: 0 }}>
              {idx === 0 && <label className="input-label">Hora</label>}
              <input className="input-control" type="time" value={item.time} onChange={e => onSet(idx, 'time', e.target.value)} disabled={isLocked} />
            </div>
          )}
          <div className="input-field" style={{ marginBottom: 0 }}>
            {idx === 0 && <label className="input-label">Descripción</label>}
            <input className="input-control" value={item.description} onChange={e => onSet(idx, 'description', e.target.value)} disabled={isLocked} required />
          </div>
          <div className="input-field" style={{ marginBottom: 0 }}>
            {idx === 0 && <label className="input-label">Servicio</label>}
            <select className="input-control" value={item.serviceId} onChange={e => onSet(idx, 'serviceId', e.target.value)} disabled={isLocked}>
              <option value="">Sin vincular</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="input-field" style={{ marginBottom: 0 }}>
            {idx === 0 && <label className="input-label">Cant.</label>}
            <input className="input-control" type="number" min="1" value={item.quantity} onChange={e => onSet(idx, 'quantity', e.target.value)} disabled={isLocked} />
          </div>
          {!isLocked && (
            <button type="button" className="link-btn link-btn--danger" style={{ paddingBottom: 'var(--space-2)' }} onClick={() => onRemove(idx)}>✕</button>
          )}
        </div>
      ))}
    </div>
  );
}
