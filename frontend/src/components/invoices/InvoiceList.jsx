import { useState, useEffect } from 'react';
import { invoicesApi } from '../../lib/api/invoices.api.js';
import { Table } from '../ui/Table.jsx';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';
import { formatCurrency, formatDate } from '../../lib/utils/format.js';

const STATUS_LABEL = {
  BORRADOR: 'Borrador',
  EMITIDA: 'Emitida',
  PAGADA_PARCIAL: 'Pago parcial',
  PAGADA_TOTAL: 'Pagada',
  ANULADA: 'Anulada',
  VENCIDA: 'Vencida',
};

const STATUS_VARIANT = {
  BORRADOR: 'neutral',
  EMITIDA: 'warning',
  PAGADA_PARCIAL: 'warning',
  PAGADA_TOTAL: 'success',
  ANULADA: 'danger',
  VENCIDA: 'danger',
};

const STATUSES = Object.keys(STATUS_LABEL);

const COLUMNS = [
  { key: 'number', label: 'Número', render: (r) => <a href={`/facturas/${r.id}`}>{r.number}</a> },
  { key: 'company', label: 'Empresa', render: (r) => r.company?.name || '—' },
  { key: 'event', label: 'Evento', render: (r) => r.event?.number || '—' },
  { key: 'issueDate', label: 'Fecha emisión', render: (r) => formatDate(r.issueDate) },
  { key: 'total', label: 'Total', render: (r) => formatCurrency(r.total) },
  { key: 'paidAmount', label: 'Pagado', render: (r) => formatCurrency(r.paidAmount) },
  {
    key: 'balance', label: 'Saldo',
    render: (r) => (
      <span style={{ color: r.balance > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
        {formatCurrency(r.balance)}
      </span>
    ),
  },
  {
    key: 'status', label: 'Estado',
    render: (r) => (
      <span className={`badge badge-${STATUS_VARIANT[r.status] || 'neutral'}`}>
        {STATUS_LABEL[r.status] || r.status}
      </span>
    ),
  },
];

export function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const res = await invoicesApi.list(params);
      setInvoices(res.data || []);
      setMeta(res.meta);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); }, [statusFilter]);
  useEffect(() => { load(); }, [page, statusFilter]);

  return (
    <div className="page-container">
      <div className="page-filters">
        <select
          className="input-control"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ maxWidth: 200 }}
        >
          <option value="">Todos los estados</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <Table columns={COLUMNS} rows={invoices} loading={loading} emptyText="No hay facturas registradas" />

      {meta && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-3)' }}>
          <p className="table-meta" style={{ margin: 0 }}>Mostrando {invoices.length} de {meta.total}</p>
          {meta.totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Button variant="secondary" onClick={() => setPage(p => p - 1)} disabled={page <= 1 || loading}>Anterior</Button>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Página {page} de {meta.totalPages}</span>
              <Button variant="secondary" onClick={() => setPage(p => p + 1)} disabled={page >= meta.totalPages || loading}>Siguiente</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
