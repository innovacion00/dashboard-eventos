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

const EMPTY_MENU      = { time: '', description: '', serviceId: '', quantity: 1, notes: '' };
const EMPTY_AV        = { description: '', serviceId: '', quantity: 1, notes: '' };
const EMPTY_PERSONNEL = { role: '', quantity: 1, notes: '' };
const EMPTY_SUPPLIER  = { name: '', service: '', contact: '', notes: '' };

function byCat(beosArr) {
  const map = {};
  for (const b of beosArr) map[b.category || '__none__'] = b;
  return map;
}

const TYPED_CATS = ['AB', 'AV', 'OTROS', 'EXTERNO'];

function buildDraft(beosArr) {
  const c     = byCat(beosArr);
  const ab    = c['AB'];
  const av    = c['AV'];
  const otros = c['OTROS'];
  const main  = c['SALON'] || beosArr.find(b => !TYPED_CATS.includes(b.category)) || null;

  return {
    setup: {
      type:    main?.setup?.type    || '',
      chairs:  main?.setup?.chairs  || '',
      tables:  main?.setup?.tables  || '',
      notes:   main?.setup?.notes   || '',
      readyAt: main?.setup?.readyAt ? main.setup.readyAt.slice(0, 16) : '',
    },
    menu: (ab?.menu || []).map(m => ({
      time: m.time || '', description: m.description || '',
      serviceId: m.serviceId?._id || m.serviceId || '',
      quantity: m.quantity || 1, notes: m.notes || '',
    })),
    menuNotes: ab?.menuNotes || '',
    audiovisual: (av?.audiovisual || []).map(a => ({
      description: a.description || '',
      serviceId: a.serviceId?._id || a.serviceId || '',
      quantity: a.quantity || 1, notes: a.notes || '',
    })),
    avNotes: av?.avNotes || '',
    // OTROS BEO → Personal tab
    personnel: (otros?.personnel || main?.personnel || []).map(p => ({ role: p.role, quantity: p.quantity || 1, notes: p.notes || '' })),
    personnelNotes: (otros || main)?.personnelNotes || '',
    suppliers: (main?.suppliers  || []).map(s => ({ name: s.name, service: s.service || '', contact: s.contact || '', notes: s.notes || '' })),
    generalNotes: main?.generalNotes || '',
  };
}

function BeoHeader({ beo, saving, onStatusChange, onDownloadPdf }) {
  if (!beo) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
      padding: 'var(--space-3) var(--space-4)',
      background: 'var(--color-gray-1)',
      borderRadius: 'var(--radius-md)',
      marginBottom: 'var(--space-4)',
      flexWrap: 'wrap',
    }}>
      <span style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)', color: 'var(--color-gold-dark)' }}>
        {beo.number}
      </span>
      <span className={`badge badge-${BEO_STATUS_VARIANT[beo.status]}`}>
        {BEO_STATUS_LABELS[beo.status]}
      </span>
      {beo.status === 'BORRADOR' && !saving && (
        <button className="link-btn" style={{ fontSize: 'var(--text-sm)' }} onClick={() => onStatusChange(beo.id, 'EMITIDO')}>
          Emitir orden
        </button>
      )}
      {beo.status === 'EMITIDO' && !saving && (
        <button className="link-btn" style={{ fontSize: 'var(--text-sm)' }} onClick={() => onStatusChange(beo.id, 'CONFIRMADO')}>
          Confirmar orden
        </button>
      )}
      {beo.status === 'CONFIRMADO' && (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Orden confirmada — solo lectura</span>
      )}
      {beo.status !== 'BORRADOR' && (
        <button className="link-btn" style={{ fontSize: 'var(--text-sm)', marginLeft: 'auto' }} onClick={() => onDownloadPdf(beo.id, beo.number)}>
          Descargar PDF
        </button>
      )}
    </div>
  );
}

export function BeoPanel({ eventId }) {
  const [beos,     setBeos]     = useState([]);
  const [services, setServices] = useState([]);
  const [tab,      setTab]      = useState('setup');
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [draft,    setDraft]    = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const [beoRes, svcRes] = await Promise.all([
        beosApi.getByEvent(eventId),
        servicesApi.list({ limit: 200 }),
      ]);
      const beosArr = beoRes.data || [];
      setBeos(beosArr);
      setServices(svcRes.data || []);
      if (beosArr.length > 0) setDraft(buildDraft(beosArr));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [eventId]);

  const handleCreate = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await beosApi.create({ eventId, category: 'SALON', menu: [], audiovisual: [], personnel: [], suppliers: [] });
      const newBeo = res.data;
      setBeos([newBeo]);
      setDraft(buildDraft([newBeo]));
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
      const c     = byCat(beos);
      const main  = c['SALON'] || beos[0];
      const ab    = c['AB'];
      const av    = c['AV'];
      const otros = c['OTROS'];

      const mainPayload = {
        setup: {
          ...draft.setup,
          chairs:  draft.setup.chairs  ? Number(draft.setup.chairs)  : undefined,
          tables:  draft.setup.tables  ? Number(draft.setup.tables)  : undefined,
          readyAt: draft.setup.readyAt ? new Date(draft.setup.readyAt).toISOString() : undefined,
        },
        suppliers:    draft.suppliers,
        generalNotes: draft.generalNotes,
      };

      if (!ab && main) {
        mainPayload.menu = draft.menu.map(m => ({ ...m, serviceId: m.serviceId || undefined, quantity: Number(m.quantity) }));
        mainPayload.menuNotes = draft.menuNotes;
      }

      if (!av && main) {
        mainPayload.audiovisual = draft.audiovisual.map(a => ({ ...a, serviceId: a.serviceId || undefined, quantity: Number(a.quantity) }));
        mainPayload.avNotes = draft.avNotes;
      }

      if (!otros && main) {
        mainPayload.personnel = draft.personnel.map(p => ({ ...p, quantity: Number(p.quantity) }));
        mainPayload.personnelNotes = draft.personnelNotes;
      }

      const saves = [];

      if (main) saves.push(beosApi.update(main.id, mainPayload));

      if (ab) saves.push(beosApi.update(ab.id, {
        menu: draft.menu.map(m => ({ ...m, serviceId: m.serviceId || undefined, quantity: Number(m.quantity) })),
        menuNotes: draft.menuNotes,
      }));

      if (av) saves.push(beosApi.update(av.id, {
        audiovisual: draft.audiovisual.map(a => ({ ...a, serviceId: a.serviceId || undefined, quantity: Number(a.quantity) })),
        avNotes: draft.avNotes,
      }));

      if (otros) saves.push(beosApi.update(otros.id, {
        personnel: draft.personnel.map(p => ({ ...p, quantity: Number(p.quantity) })),
        personnelNotes: draft.personnelNotes,
      }));

      await Promise.all(saves);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (beoId, status) => {
    setSaving(true);
    setError('');
    try {
      await beosApi.changeStatus(beoId, status);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = (beoId, beoNumber) => {
    beosApi.downloadPdf(beoId, `${beoNumber}.pdf`).catch(() => setError('Error al descargar el PDF'));
  };

  const setSetup = (field, value) => setDraft(d => ({ ...d, setup: { ...d.setup, [field]: value } }));
  const setList  = (list, setter) => setDraft(d => ({ ...d, [list]: setter(d[list]) }));
  const addItem    = (list, empty) => setList(list, items => [...items, { ...empty }]);
  const removeItem = (list, idx)   => setList(list, items => items.filter((_, i) => i !== idx));
  const setItem    = (list, idx, field, value) => setList(list, items => {
    const next = [...items];
    next[idx] = { ...next[idx], [field]: value };
    return next;
  });

  const abServices = services.filter(s => s.category === 'AB');
  const avServices = services.filter(s => s.category === 'AV');

  if (loading) return <p className="page-loading">Cargando BEO...</p>;

  if (beos.length === 0) {
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

  const c        = byCat(beos);
  const abBeo    = c['AB'];
  const avBeo    = c['AV'];
  const otrosBeo = c['OTROS'];
  const mainBeo  = c['SALON'] || beos.find(b => !TYPED_CATS.includes(b.category)) || null;

  // SALON → Montaje, AB → A&B, AV → AV, OTROS → Personal
  const tabBeo = { setup: mainBeo, menu: abBeo, audiovisual: avBeo, personnel: otrosBeo || mainBeo, suppliers: mainBeo, notes: mainBeo };
  const isTabLocked = (t) => tabBeo[t]?.status === 'CONFIRMADO';
  const allLocked = beos.every(b => b.status === 'CONFIRMADO');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="tabs" style={{ marginBottom: 0 }}>
          {[['setup', 'Montaje'], ['menu', 'A&B'], ['audiovisual', 'AV'], ['personnel', 'Personal'], ['suppliers', 'Proveedores'], ['payments', 'Pagos'], ['notes', 'Notas']].map(([t, l]) => (
            <button key={t} className={`tab-btn ${tab === t ? 'tab-btn--active' : ''}`} onClick={() => setTab(t)}>{l}</button>
          ))}
        </div>
        {!allLocked && (
          <Button variant="secondary" onClick={handleSave} disabled={saving} style={{ flexShrink: 0 }}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        )}
      </div>

      {/* Montaje — SALON BEO */}
      {tab === 'setup' && draft && (
        <div>
          <BeoHeader beo={mainBeo} saving={saving} onStatusChange={handleStatusChange} onDownloadPdf={handleDownloadPdf} />
          <div className="form-grid-2">
            <div className="input-field">
              <label className="input-label">Tipo de montaje</label>
              <select className="input-control" value={draft.setup.type} onChange={e => setSetup('type', e.target.value)} disabled={isTabLocked('setup')}>
                <option value="">Sin especificar</option>
                {SETUP_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="input-field">
              <label className="input-label">Montaje listo a las</label>
              <input className="input-control" type="datetime-local" value={draft.setup.readyAt} onChange={e => setSetup('readyAt', e.target.value)} disabled={isTabLocked('setup')} />
            </div>
            <div className="input-field">
              <label className="input-label">Sillas</label>
              <input className="input-control" type="number" min="0" value={draft.setup.chairs} onChange={e => setSetup('chairs', e.target.value)} disabled={isTabLocked('setup')} />
            </div>
            <div className="input-field">
              <label className="input-label">Mesas</label>
              <input className="input-control" type="number" min="0" value={draft.setup.tables} onChange={e => setSetup('tables', e.target.value)} disabled={isTabLocked('setup')} />
            </div>
            <div className="input-field" style={{ gridColumn: '1/-1' }}>
              <label className="input-label">Notas de montaje</label>
              <textarea className="input-control" rows={3} value={draft.setup.notes} onChange={e => setSetup('notes', e.target.value)} disabled={isTabLocked('setup')} />
            </div>
          </div>
        </div>
      )}

      {/* A&B — AB BEO */}
      {tab === 'menu' && draft && (
        <div>
          <BeoHeader beo={abBeo} saving={saving} onStatusChange={handleStatusChange} onDownloadPdf={handleDownloadPdf} />
          {!abBeo && (
            <p className="text-muted" style={{ marginBottom: 'var(--space-3)' }}>
              No hay orden de A&B para este evento. Puedes agregar ítems manualmente.
            </p>
          )}
          <BeoItemList
            items={draft.menu}
            isLocked={isTabLocked('menu')}
            onAdd={() => addItem('menu', EMPTY_MENU)}
            onRemove={idx => removeItem('menu', idx)}
            onSet={(idx, f, v) => setItem('menu', idx, f, v)}
            services={abServices}
            showTime
            emptyText="Sin ítems de A&B"
          />
          <div className="input-field" style={{ marginTop: 'var(--space-4)' }}>
            <label className="input-label">Notas del menú</label>
            <textarea
              className="input-control"
              rows={3}
              value={draft.menuNotes}
              onChange={e => setDraft(d => ({ ...d, menuNotes: e.target.value }))}
              disabled={isTabLocked('menu')}
              placeholder="Observaciones sobre el menú, restricciones alimentarias, preferencias..."
            />
          </div>
        </div>
      )}

      {/* AV — AV BEO */}
      {tab === 'audiovisual' && draft && (
        <div>
          <BeoHeader beo={avBeo} saving={saving} onStatusChange={handleStatusChange} onDownloadPdf={handleDownloadPdf} />
          {!avBeo && (
            <p className="text-muted" style={{ marginBottom: 'var(--space-3)' }}>
              No hay orden de AV para este evento. Puedes agregar ítems manualmente.
            </p>
          )}
          <BeoItemList
            items={draft.audiovisual}
            isLocked={isTabLocked('audiovisual')}
            onAdd={() => addItem('audiovisual', EMPTY_AV)}
            onRemove={idx => removeItem('audiovisual', idx)}
            onSet={(idx, f, v) => setItem('audiovisual', idx, f, v)}
            services={avServices}
            emptyText="Sin equipos AV"
          />
          <div className="input-field" style={{ marginTop: 'var(--space-4)' }}>
            <label className="input-label">Notas</label>
            <textarea
              className="input-control"
              rows={3}
              value={draft.avNotes}
              onChange={e => setDraft(d => ({ ...d, avNotes: e.target.value }))}
              disabled={isTabLocked('audiovisual')}
              placeholder="Observaciones sobre equipos audiovisuales..."
            />
          </div>
        </div>
      )}

      {/* Personal — OTROS BEO */}
      {tab === 'personnel' && draft && (
        <div>
          <BeoHeader beo={otrosBeo || mainBeo} saving={saving} onStatusChange={handleStatusChange} onDownloadPdf={handleDownloadPdf} />
          {!isTabLocked('personnel') && (
            <Button variant="secondary" onClick={() => addItem('personnel', EMPTY_PERSONNEL)} style={{ marginBottom: 'var(--space-3)' }}>
              + Agregar personal
            </Button>
          )}
          {draft.personnel.length === 0 && <p className="text-muted">Sin personal asignado.</p>}
          {draft.personnel.map((p, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 'var(--space-2)', alignItems: 'end', marginBottom: 'var(--space-2)' }}>
              <div className="input-field" style={{ marginBottom: 0 }}>
                {idx === 0 && <label className="input-label">Rol</label>}
                <input className="input-control" value={p.role} onChange={e => setItem('personnel', idx, 'role', e.target.value)} disabled={isTabLocked('personnel')} placeholder="Ej: Mesero" />
              </div>
              <div className="input-field" style={{ marginBottom: 0 }}>
                {idx === 0 && <label className="input-label">Cantidad</label>}
                <input className="input-control" type="number" min="1" value={p.quantity} onChange={e => setItem('personnel', idx, 'quantity', e.target.value)} disabled={isTabLocked('personnel')} />
              </div>
              {!isTabLocked('personnel') && (
                <button type="button" className="link-btn link-btn--danger" style={{ paddingBottom: 'var(--space-2)' }} onClick={() => removeItem('personnel', idx)}>✕</button>
              )}
            </div>
          ))}
          <div className="input-field" style={{ marginTop: 'var(--space-4)' }}>
            <label className="input-label">Notas</label>
            <textarea
              className="input-control"
              rows={3}
              value={draft.personnelNotes}
              onChange={e => setDraft(d => ({ ...d, personnelNotes: e.target.value }))}
              disabled={isTabLocked('personnel')}
              placeholder="Observaciones sobre el personal de servicio..."
            />
          </div>
        </div>
      )}

      {/* Proveedores */}
      {tab === 'suppliers' && draft && (
        <div>
          {!isTabLocked('suppliers') && (
            <Button variant="secondary" onClick={() => addItem('suppliers', EMPTY_SUPPLIER)} style={{ marginBottom: 'var(--space-3)' }}>
              + Agregar proveedor
            </Button>
          )}
          {draft.suppliers.length === 0 && <p className="text-muted">Sin proveedores externos.</p>}
          {draft.suppliers.map((s, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr auto', gap: 'var(--space-2)', alignItems: 'end', marginBottom: 'var(--space-2)' }}>
              <div className="input-field" style={{ marginBottom: 0 }}>
                {idx === 0 && <label className="input-label">Proveedor</label>}
                <input className="input-control" value={s.name} onChange={e => setItem('suppliers', idx, 'name', e.target.value)} disabled={isTabLocked('suppliers')} />
              </div>
              <div className="input-field" style={{ marginBottom: 0 }}>
                {idx === 0 && <label className="input-label">Servicio</label>}
                <input className="input-control" value={s.service} onChange={e => setItem('suppliers', idx, 'service', e.target.value)} disabled={isTabLocked('suppliers')} />
              </div>
              <div className="input-field" style={{ marginBottom: 0 }}>
                {idx === 0 && <label className="input-label">Contacto</label>}
                <input className="input-control" value={s.contact} onChange={e => setItem('suppliers', idx, 'contact', e.target.value)} disabled={isTabLocked('suppliers')} />
              </div>
              {!isTabLocked('suppliers') && (
                <button type="button" className="link-btn link-btn--danger" style={{ paddingBottom: 'var(--space-2)' }} onClick={() => removeItem('suppliers', idx)}>✕</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagos */}
      {tab === 'payments' && (
        <BeoPayments beos={beos} onReload={load} />
      )}

      {/* Notas */}
      {tab === 'notes' && draft && (
        <div>
          <div className="input-field">
            <label className="input-label">Notas generales del BEO</label>
            <textarea className="input-control" rows={8} value={draft.generalNotes} onChange={e => setDraft(d => ({ ...d, generalNotes: e.target.value }))} disabled={isTabLocked('notes')} />
          </div>
        </div>
      )}
    </div>
  );
}

function BeoItemList({ items, isLocked, onAdd, onRemove, onSet, services, showTime, emptyText }) {
  return (
    <div>
      {!isLocked && (
        <Button variant="secondary" onClick={onAdd} style={{ marginBottom: 'var(--space-3)' }}>+ Agregar ítem</Button>
      )}
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

const PAYMENT_METHODS = [
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'TARJETA', label: 'Tarjeta' },
  { value: 'OTRO', label: 'Otro' },
];

function BeoPayments({ beos, onReload }) {
  const [showForm, setShowForm] = useState(false);
  const [selectedBeo, setSelectedBeo] = useState('');
  const [form, setForm] = useState({ amount: '', method: 'TRANSFERENCIA', reference: '', date: '', notes: '' });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const allPayments = beos.flatMap(b =>
    (b.paymentEvidence || []).map(p => ({ ...p, beoId: b.id, beoNumber: b.number, beoCategory: b.category }))
  );

  const CATEGORY_LABELS = { SALON: 'Montaje', AB: 'A&B', AV: 'AV', OTROS: 'Personal', EXTERNO: 'Externo' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const beoId = selectedBeo || beos[0]?.id;
    if (!beoId || !form.amount) return;
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('amount', form.amount);
      fd.append('method', form.method);
      fd.append('reference', form.reference);
      fd.append('date', form.date || new Date().toISOString());
      fd.append('notes', form.notes);
      if (file) fd.append('file', file);
      await beosApi.addPayment(beoId, fd);
      setForm({ amount: '', method: 'TRANSFERENCIA', reference: '', date: '', notes: '' });
      setFile(null);
      setShowForm(false);
      await onReload();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (beoId, paymentId) => {
    if (!confirm('¿Eliminar esta evidencia de pago?')) return;
    try {
      await beosApi.removePayment(beoId, paymentId);
      await onReload();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <Button variant="secondary" onClick={() => setShowForm(!showForm)} style={{ marginBottom: 'var(--space-3)' }}>
        {showForm ? 'Cancelar' : '+ Registrar pago'}
      </Button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ padding: 'var(--space-4)', background: 'var(--color-gray-1)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
          <div className="form-grid-2">
            <div className="input-field">
              <label className="input-label">BEO</label>
              <select className="input-control" value={selectedBeo} onChange={e => setSelectedBeo(e.target.value)}>
                {beos.map(b => <option key={b.id} value={b.id}>{b.number} — {CATEGORY_LABELS[b.category] || b.category}</option>)}
              </select>
            </div>
            <div className="input-field">
              <label className="input-label">Monto <span className="input-required">*</span></label>
              <input className="input-control" type="number" min="0" step="any" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
            </div>
            <div className="input-field">
              <label className="input-label">Método de pago</label>
              <select className="input-control" value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))}>
                {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div className="input-field">
              <label className="input-label">Referencia</label>
              <input className="input-control" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} placeholder="N° de transacción" />
            </div>
            <div className="input-field">
              <label className="input-label">Fecha del pago</label>
              <input className="input-control" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="input-field">
              <label className="input-label">Comprobante (imagen o PDF)</label>
              <input className="input-control" type="file" accept="image/*,.pdf" onChange={e => setFile(e.target.files[0] || null)} />
            </div>
          </div>
          <div className="input-field">
            <label className="input-label">Notas</label>
            <input className="input-control" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="form-actions">
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Registrar pago'}</Button>
          </div>
        </form>
      )}

      {allPayments.length === 0 && !showForm && <p className="text-muted">Sin evidencias de pago registradas.</p>}

      {allPayments.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
          <thead>
            <tr style={{ background: 'var(--color-gray-1)' }}>
              <th style={TH}>BEO</th>
              <th style={TH}>Fecha</th>
              <th style={TH}>Método</th>
              <th style={TH}>Referencia</th>
              <th style={{ ...TH, textAlign: 'right' }}>Monto</th>
              <th style={TH}>Comprobante</th>
              <th style={TH}></th>
            </tr>
          </thead>
          <tbody>
            {allPayments.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={TD}>{p.beoNumber}</td>
                <td style={TD}>{p.date ? new Date(p.date).toLocaleDateString('es-CO') : '—'}</td>
                <td style={TD}>{PAYMENT_METHODS.find(m => m.value === p.method)?.label || p.method}</td>
                <td style={TD}>{p.reference || '—'}</td>
                <td style={{ ...TD, textAlign: 'right', fontWeight: 'var(--font-semibold)' }}>
                  {Number(p.amount).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
                </td>
                <td style={TD}>
                  {p.file ? <a href={p.file} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>Ver</a> : '—'}
                </td>
                <td style={TD}>
                  <button className="link-btn link-btn--danger" onClick={() => handleRemove(p.beoId, p.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const TH = { padding: '8px 12px', textAlign: 'left', fontWeight: 'var(--font-semibold)', borderBottom: '1px solid var(--color-border)' };
const TD = { padding: '8px 12px', verticalAlign: 'middle' };
