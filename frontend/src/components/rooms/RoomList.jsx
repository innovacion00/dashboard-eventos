import { useState, useEffect } from 'react';
import { roomsApi } from '../../lib/api/rooms.api.js';
import { Alert } from '../ui/Alert.jsx';
import { formatCurrency } from '../../lib/utils/format.js';

const CAPACITY_LABELS = {
  auditorium: 'Auditorio',
  school: 'Aula',
  uShape: 'U-Shape',
  cocktail: 'Cóctel',
  banquet: 'Banquete',
};

export function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    roomsApi.list().then((res) => setRooms(res.data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Salones</h1>
      </div>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {loading ? <p className="text-muted">Cargando...</p> : (
        <div className="room-grid">
          {rooms.length === 0 ? (
            <p className="text-muted">No hay salones registrados.</p>
          ) : rooms.map((room) => (
            <div key={room._id} className="room-card">
              <h2 className="room-name">{room.name}</h2>
              {room.aliases?.length > 0 && (
                <p className="room-aliases">Alias: {room.aliases.join(', ')}</p>
              )}
              {room.description && <p className="room-desc">{room.description}</p>}
              <div className="room-capacities">
                {Object.entries(CAPACITY_LABELS).map(([key, label]) =>
                  room.capacities?.[key] != null ? (
                    <div key={key} className="room-capacity-item">
                      <span className="room-capacity-value">{room.capacities[key]}</span>
                      <span className="room-capacity-label">{label}</span>
                    </div>
                  ) : null
                )}
              </div>
              {room.baseRate != null && (
                <p className="room-rate">Tarifa base: {formatCurrency(room.baseRate)}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
