import { useState, useEffect } from 'react';
import { opportunitiesApi } from '../../lib/api/opportunities.api.js';
import { Table } from '../ui/Table.jsx';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Modal } from '../ui/Modal.jsx';
import { OpportunityForm } from './OpportunityForm.jsx';
import { StageSelector } from './StageSelector.jsx';
import { formatCurrency, formatDate } from '../../lib/utils/format.js';

const STAGE_LABELS = {
  PROSPECTO_INICIAL: 'Prospecto inicial',
  CALIFICADO: 'Calificado',
  VISITA_INSPECCION: 'Visita / Inspección',
  COTIZADO: 'Cotizado',
  NEGOCIACION: 'Negociación',
  APROBADO_PENDIENTE_PAGO: 'Aprobado, pendiente pago',
  CONFIRMADO: 'Confirmado',
  PERDIDO: 'Perdido',
};

const STAGE_VARIANT = {
  CONFIRMADO: 'badge-success',
  PERDIDO: 'badge-danger',
  NEGOCIACION: 'badge-warning',
  APROBADO_PENDIENTE_PAGO: 'badge-warning',
};

const COLUMNS = [
  {
    key: 'company', label: 'Empresa',
    render: (r) => <a href={`/empresas/${r.company?.id || r.company?._id}`}>{r.company?.name || '—'}</a>,
  },
  {
    key: 'stage', label: 'Etapa',
    render: (r) => (
      <span className={`badge ${STAGE_VARIANT[r.stage] || 'badge-neutral'}`}>
        {STAGE_LABELS[r.stage] || r.stage}
      </span>
    ),
  },
  { key: 'eventType', label: 'Tipo de evento', render: (r) => r.eventType || '—' },
  { key: 'estimatedValue', label: 'Valor estimado', render: (r) => formatCurrency(r.estimatedValue) },
  { key: 'weightedValue', label: 'Valor ponderado', render: (r) => formatCurrency(r.weightedValue) },
  { key: 'projectionMonth', label: 'Mes proyección' },
  { key: 'nextActionAt', label: 'Próxima acción', render: (r) => r.stage === 'PROSPECTO_INICIAL' ? 'Correo electrónico' : formatDate(r.nextActionAt) },
  {
    key: 'overdue', label: '', width: 60,
    render: (r) => r.isOverdue ? <span className="badge badge-danger">Vencida</span> : null,
  },
  {
    key: 'actions', label: '', width: 120,
    render: (r, onStage, onEdit) => (
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <button className="link-btn" onClick={() => onEdit(r)}>Editar</button>
        <button className="link-btn" onClick={() => onStage(r)}>Etapa</button>
      </div>
    ),
  },
];

export function OpportunityList() {
  const [opps, setOpps] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [stageFilter, setStageFilter] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (stageFilter) params.stage = stageFilter;
      if (search) params.q = search;
      const res = await opportunitiesApi.list(params);
      setOpps(res.data);
      setMeta(res.meta);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); }, [stageFilter, search]);
  useEffect(() => { load(); }, [page, stageFilter, search]);

  const handleEdit = (opp) => { setSelected(opp); setModal('edit'); };
  const handleStage = (opp) => { setSelected(opp); setModal('stage'); };

  const columns = COLUMNS.map((col) =>
    col.key === 'actions'
      ? { ...col, render: (r) => col.render(r, handleStage, handleEdit) }
      : col
  );

  return (
    <div className="page-container">
      <div className="page-filters">
        <input
          className="input-control"
          placeholder="Buscar empresa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        <select className="input-control" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} style={{ maxWidth: 220 }}>
          <option value="">Todas las etapas</option>
          {Object.entries(STAGE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <Button style={{ marginLeft: 'auto' }} onClick={() => { setSelected(null); setModal('new'); }}>Nueva oportunidad</Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <Table columns={columns} rows={opps} loading={loading} emptyText="No hay oportunidades" />

      {meta && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-3)' }}>
          <p className="table-meta" style={{ margin: 0 }}>Mostrando {opps.length} de {meta.total}</p>
          {meta.totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Button variant="secondary" onClick={() => setPage(p => p - 1)} disabled={page <= 1 || loading}>Anterior</Button>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Página {page} de {meta.totalPages}</span>
              <Button variant="secondary" onClick={() => setPage(p => p + 1)} disabled={page >= meta.totalPages || loading}>Siguiente</Button>
            </div>
          )}
        </div>
      )}

      <Modal open={modal === 'new' || modal === 'edit'} title={modal === 'edit' ? 'Editar oportunidad' : 'Nueva oportunidad'} onClose={() => setModal(null)} size="lg">
        <OpportunityForm initial={selected} onSaved={() => { setModal(null); load(); }} onCancel={() => setModal(null)} />
      </Modal>

      <Modal open={modal === 'stage'} title="Cambiar etapa" onClose={() => setModal(null)} size="sm">
        {selected && (
          <StageSelector
            opportunity={selected}
            onSaved={() => { setModal(null); load(); }}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>
    </div>
  );
}
