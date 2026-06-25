import { useState, useEffect } from 'react';
import { planningApi } from '../../lib/api/planning.api.js';
import { roomsApi } from '../../lib/api/rooms.api.js';
import { Alert } from '../ui/Alert.jsx';
import './PlanningGrid.css';

const TIME_SLOTS = [
  { label: '00:00 — 04:00', start: 0, end: 4 },
  { label: '04:00 — 08:00', start: 4, end: 8 },
  { label: '08:00 — 12:00', start: 8, end: 12 },
  { label: '12:00 — 16:00', start: 12, end: 16 },
  { label: '16:00 — 20:00', start: 16, end: 20 },
  { label: '20:00 — 24:00', start: 20, end: 24 },
];

const DAY_NAMES_FULL = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function formatWeekLabel(monday) {
  const sunday = addDays(monday, 6);
  const m1 = MONTH_NAMES[monday.getMonth()];
  const m2 = MONTH_NAMES[sunday.getMonth()];
  const y = monday.getFullYear();
  if (m1 === m2) return `${monday.getDate()} — ${sunday.getDate()} ${m1} ${y}`;
  return `${monday.getDate()} ${m1} — ${sunday.getDate()} ${m2} ${y}`;
}

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseHour(timeStr) {
  if (!timeStr) return 8;
  return parseInt(timeStr.split(':')[0], 10);
}

function toUtcDateStr(d) {
  const dt = new Date(d);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
}

function occupationsForCell(occupations, dateStr, slot) {
  return occupations.filter(o => {
    const oDate = toUtcDateStr(o.date);
    if (oDate !== dateStr) return false;
    const startH = parseHour(o.startTime);
    const endH = parseHour(o.endTime);
    return startH < slot.end && endH > slot.start;
  });
}

export function PlanningGrid() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [weekStart, setWeekStart] = useState(new Date());
  const [occupations, setOccupations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    roomsApi.list().then(res => {
      const list = res.data || [];
      setRooms(list);
      if (list.length > 0) setSelectedRoom(String(list[0]._id || list[0].id));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedRoom) return;
    setLoading(true);
    setError('');
    const startDate = toDateStr(weekStart);
    const endDate = toDateStr(addDays(weekStart, 6));
    planningApi.getOccupations({ roomId: selectedRoom, startDate, endDate })
      .then(res => setOccupations(res.data || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedRoom, weekStart]);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="page-container">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="planning-header">
        <div className="input-field" style={{ marginBottom: 0, minWidth: 200 }}>
          <label className="input-label">Salón</label>
          <select className="input-control" value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)}>
            {rooms.map(r => (
              <option key={String(r._id || r.id)} value={String(r._id || r.id)}>{r.name}</option>
            ))}
          </select>
        </div>

        <div className="input-field" style={{ marginBottom: 0, minWidth: 180 }}>
          <label className="input-label">Fecha inicio</label>
          <input
            className="input-control"
            type="date"
            value={toDateStr(weekStart)}
            onChange={e => {
              const d = new Date(e.target.value + 'T00:00:00');
              if (!isNaN(d.getTime())) setWeekStart(d);
            }}
          />
        </div>
      </div>

      <div className="planning-grid" onClick={() => setTooltip(null)}>
        {/* Header row */}
        <div className="planning-grid__header">Hora</div>
        {weekDays.map((d, i) => (
          <div className="planning-grid__header" key={i}>
            {DAY_NAMES_FULL[d.getDay()]}<br />{d.getDate()}/{d.getMonth() + 1}
          </div>
        ))}

        {/* Rows */}
        {TIME_SLOTS.map((slot, si) => (
          <>
            <div className="planning-grid__hour-label" key={`h-${si}`}>
              {slot.label}
            </div>
            {weekDays.map((d, di) => {
              const dateStr = toDateStr(d);
              const cellKey = `${si}-${di}`;
              const cellOccs = occupationsForCell(occupations, dateStr, slot);

              return (
                <div className="planning-grid__cell" key={cellKey} style={{ position: 'relative' }}>
                  {cellOccs.map(o => (
                    <div
                      key={o.id}
                      className={`planning-chip planning-chip--${o.type}`}
                      title={`${o.number} — ${o.company}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (tooltip?.id === o.id) { setTooltip(null); return; }
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({ ...o, x: rect.left, y: rect.bottom + 4 });
                      }}
                    >
                      {o.number}
                    </div>
                  ))}
                </div>
              );
            })}
          </>
        ))}
      </div>

      <div className="planning-legend">
        <div className="planning-legend__item">
          <span className="planning-legend__dot planning-legend__dot--quote"></span> Cotización (pre-reserva)
        </div>
        <div className="planning-legend__item">
          <span className="planning-legend__dot planning-legend__dot--event"></span> Evento confirmado
        </div>
      </div>

      {loading && <p className="page-loading" style={{ marginTop: 'var(--space-4)' }}>Cargando disponibilidad...</p>}

      {tooltip && (
        <div className="planning-tooltip" style={{ left: tooltip.x, top: tooltip.y }} onClick={e => e.stopPropagation()}>
          <div className="planning-tooltip__title">{tooltip.number}</div>
          <div className="planning-tooltip__row"><span>Tipo:</span> <strong>{tooltip.type === 'quote' ? 'Cotización' : 'Evento'}</strong></div>
          <div className="planning-tooltip__row"><span>Empresa:</span> <strong>{tooltip.company}</strong></div>
          <div className="planning-tooltip__row"><span>Horario:</span> <strong>{tooltip.startTime} — {tooltip.endTime}</strong></div>
          <div className="planning-tooltip__row"><span>Estado:</span> <strong>{tooltip.status}</strong></div>
          {tooltip.eventType && <div className="planning-tooltip__row"><span>Tipo evento:</span> <strong>{tooltip.eventType}</strong></div>}
        </div>
      )}
    </div>
  );
}
