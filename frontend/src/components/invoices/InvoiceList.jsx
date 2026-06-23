import { useState, useEffect } from 'react';
import { invoicesApi } from '../../lib/api/invoices.api.js';
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

export function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [meta, setMeta] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await invoicesApi.list({ status: statusFilter || undefined });
      setInvoices(res.data || []);
      setMeta(res.meta);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  return (
    <div className="page-container">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      <div className="page-filters">
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Todos los estados</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
        <a href="/facturas/nueva" className="btn btn-primary" style={{ marginLeft: 'auto' }}>Nueva factura</a>
      </div>
      {loading ? (
        <p className="text-muted">Cargando...</p>
      ) : invoices.length === 0 ? (
        <p className="text-muted">No hay facturas registradas.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Empresa</th>
              <th>Evento</th>
              <th>Fecha emisión</th>
              <th>Total</th>
              <th>Pagado</th>
              <th>Saldo</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td><strong>{inv.number}</strong></td>
                <td>{inv.company?.name || '—'}</td>
                <td>{inv.event?.number || '—'}</td>
                <td>{formatDate(inv.issueDate)}</td>
                <td>{formatCurrency(inv.total)}</td>
                <td>{formatCurrency(inv.paidAmount)}</td>
                <td style={{ color: inv.balance > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                  {formatCurrency(inv.balance)}
                </td>
                <td>
                  <span className={`badge badge-${STATUS_VARIANT[inv.status]}`}>
                    {STATUS_LABEL[inv.status]}
                  </span>
                </td>
                <td>
                  <a href={`/facturas/${inv.id}`} className="link-btn">Ver</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {meta && (
        <p className="text-muted" style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-3)' }}>
          {meta.total} registro(s) — Página {meta.page} de {meta.totalPages}
        </p>
      )}
    </div>
  );
}
