import { useState, useEffect } from 'react';
import { roomsApi } from '../../lib/api/rooms.api.js';
import { Alert } from '../ui/Alert.jsx';
import { Button } from '../ui/Button.jsx';
import { Modal } from '../ui/Modal.jsx';
import { formatCurrency } from '../../lib/utils/format.js';
import { getUser } from '../../lib/auth/session.js';

const CAPACITY_LABELS = {
  auditorium: 'Auditorio',
  school: 'Aula',
  uShape: 'U-Shape',
  cocktail: 'Cóctel',
  banquet: 'Banquete',
};

const EDITABLE_ROLES = [
  'ADMINISTRADOR', 'DIRECCION_GENERAL', 'GERENCIA_HOTEL', 'LIDER_COMERCIAL',
];

function RoomEditModal({ room, onSaved, onClose }) {
  const [description, setDescription] = useState(room.description || '');
  const [photos,      setPhotos]      = useState(room.photos || []);
  const [newUrl,      setNewUrl]      = useState('');
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await roomsApi.update(room.id, { description, photos });
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const addUrl = () => {
    const url = newUrl.trim();
    if (!url || photos.includes(url)) return;
    setPhotos(prev => [...prev, url]);
    setNewUrl('');
  };

  const removePhoto = (url) => setPhotos(prev => prev.filter(p => p !== url));

  return (
    <div>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="input-field">
        <label className="input-label">Descripción del salón</label>
        <textarea
          className="input-control"
          rows={4}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe el salón: características, equipamiento, ubicación..."
        />
      </div>

      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
        <label className="input-label">Fotos del salón (URLs)</label>

        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
          <input
            className="input-control"
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addUrl())}
            placeholder="https://ejemplo.com/foto.jpg"
          />
          <Button variant="secondary" onClick={addUrl} style={{ flexShrink: 0 }}>Agregar</Button>
        </div>

        {photos.length === 0 && (
          <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>Sin fotos. Pega un enlace de imagen y haz clic en Agregar.</p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
          {photos.map((url) => (
            <div key={url} style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--color-gray-1)' }}>
              <img
                src={url}
                alt="Foto del salón"
                style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
              <button
                onClick={() => removePhoto(url)}
                style={{
                  position: 'absolute', top: 4, right: 4,
                  background: 'rgba(0,0,0,0.6)', color: '#fff',
                  border: 'none', borderRadius: '50%',
                  width: 22, height: 22, cursor: 'pointer',
                  fontSize: 12, lineHeight: '22px', textAlign: 'center', padding: 0,
                }}
                title="Quitar foto"
              >✕</button>
            </div>
          ))}
        </div>
      </div>

      <div className="form-actions" style={{ marginTop: 'var(--space-5)' }}>
        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </div>
  );
}

export function RoomList() {
  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [editing, setEditing] = useState(null);

  const user = getUser();
  const canEdit = user && EDITABLE_ROLES.includes(user.role);

  const load = () => {
    roomsApi.list()
      .then(res => setRooms(res.data || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSaved = () => {
    setEditing(null);
    load();
  };

  return (
    <div className="page-container">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {loading ? <p className="text-muted">Cargando...</p> : (
        <div className="room-grid">
          {rooms.length === 0 ? (
            <p className="text-muted">No hay salones registrados.</p>
          ) : rooms.map((room) => (
            <div key={room.id} className="room-card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Foto principal */}
              {room.photos?.length > 0 ? (
                <div style={{ position: 'relative', height: 180 }}>
                  <img
                    src={room.photos[0]}
                    alt={room.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  {room.photos.length > 1 && (
                    <span style={{
                      position: 'absolute', bottom: 8, right: 8,
                      background: 'rgba(0,0,0,0.55)', color: '#fff',
                      fontSize: 11, borderRadius: 10, padding: '2px 8px',
                    }}>
                      +{room.photos.length - 1} fotos
                    </span>
                  )}
                </div>
              ) : null}

              {/* Contenido con padding propio */}
              <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h2 className="room-name" style={{ margin: 0 }}>{room.name}</h2>
                  {canEdit && (
                    <button className="link-btn" style={{ fontSize: 'var(--text-sm)', flexShrink: 0 }} onClick={() => setEditing(room)}>
                      Editar
                    </button>
                  )}
                </div>

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

                {room.photos?.length > 1 && (
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    {room.photos.slice(1).map((url) => (
                      <img key={url} src={url} alt="" style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={Boolean(editing)} title={editing ? `Editar: ${editing.name}` : ''} size="lg" onClose={() => setEditing(null)}>
        {editing && (
          <RoomEditModal
            room={editing}
            onSaved={handleSaved}
            onClose={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  );
}
