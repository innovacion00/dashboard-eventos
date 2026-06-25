import { useState, useEffect } from 'react';
import { surveysApi } from '../../lib/api/surveys.api.js';
import { Table } from '../ui/Table.jsx';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Modal } from '../ui/Modal.jsx';
import { SurveyForm } from './SurveyForm.jsx';
import { formatDate } from '../../lib/utils/format.js';

const STATUS_LABELS = {
  BORRADOR: 'Borrador',
  ACTIVA: 'Activa',
  CERRADA: 'Cerrada',
};

const STATUS_VARIANT = {
  BORRADOR: 'neutral',
  ACTIVA: 'success',
  CERRADA: 'warning',
};

export function SurveyList() {
  const [surveys, setSurveys] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const res = await surveysApi.list(params);
      setSurveys(res.data || []);
      setMeta(res.meta || null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); }, [statusFilter]);
  useEffect(() => { load(); }, [page, statusFilter]);

  const COLUMNS = [
    {
      key: 'event',
      label: 'Evento',
      render: (r) => (
        <a href={`/encuestas/${r.id || r._id}`}>
          {r.event?.name || r.event?.number || '—'}
        </a>
      ),
    },
    {
      key: 'title',
      label: 'Titulo',
      render: (r) => (
        <a href={`/encuestas/${r.id || r._id}`}>{r.title}</a>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (r) => (
        <span className={`badge badge-${STATUS_VARIANT[r.status] || 'neutral'}`}>
          {STATUS_LABELS[r.status] || r.status}
        </span>
      ),
    },
    {
      key: 'responsesCount',
      label: 'Respuestas',
      render: (r) => r.responsesCount ?? 0,
    },
    {
      key: 'npsScore',
      label: 'NPS',
      render: (r) => {
        if (r.npsScore == null) return '—';
        const color = r.npsScore > 50 ? 'var(--color-success)' : r.npsScore >= 0 ? 'var(--color-gold-dark)' : 'var(--color-danger)';
        return <strong style={{ color }}>{r.npsScore}</strong>;
      },
    },
    {
      key: 'createdAt',
      label: 'Creada',
      render: (r) => formatDate(r.createdAt),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (r) => (
        <a href={`/encuestas/${r.id || r._id}`} style={{ color: 'var(--color-primary)', fontSize: 'var(--text-sm)' }}>
          Ver detalle
        </a>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-filters">
        <select
          className="input-control"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ maxWidth: 200 }}
        >
          <option value="">Todas</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <Button variant="secondary" onClick={() => setShowQr(true)} style={{ marginLeft: 'auto' }}>
          Ver QR Encuesta
        </Button>
        <Button onClick={() => setShowCreate(true)}>
          Nueva encuesta
        </Button>
      </div>

      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

      <Table
        columns={COLUMNS}
        rows={surveys}
        loading={loading}
        emptyText="No hay encuestas registradas"
      />

      {meta && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-3)' }}>
          <p className="table-meta" style={{ margin: 0 }}>
            Mostrando {surveys.length} de {meta.total}
          </p>
          {meta.totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Button variant="secondary" onClick={() => setPage((p) => p - 1)} disabled={page <= 1 || loading}>
                Anterior
              </Button>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Pagina {page} de {meta.totalPages}
              </span>
              <Button variant="secondary" onClick={() => setPage((p) => p + 1)} disabled={page >= meta.totalPages || loading}>
                Siguiente
              </Button>
            </div>
          )}
        </div>
      )}

      <Modal open={showCreate} title="Nueva encuesta" size="lg" onClose={() => setShowCreate(false)}>
        <SurveyForm
          onSaved={() => { setShowCreate(false); load(); }}
          onCancel={() => setShowCreate(false)}
        />
      </Modal>

      <Modal open={showQr} title="QR — Encuesta de satisfacción" onClose={() => setShowQr(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--space-4)' }}>
          <img src="/qr-encuesta.png" alt="QR Encuesta" style={{ width: 280, height: 280, objectFit: 'contain' }} />
          <p style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
            Escanea el código QR para acceder al formulario de encuesta de satisfacción.
          </p>
          <a
            href="https://b24-xz8e0u.bitrix24.site/eventos-formulario/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-primary)' }}
          >
            Abrir enlace
          </a>
        </div>
      </Modal>
    </div>
  );
}
