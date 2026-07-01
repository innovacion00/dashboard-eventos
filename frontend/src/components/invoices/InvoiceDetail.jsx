import { useState, useEffect } from 'react';
import { invoicesApi } from '../../lib/api/invoices.api.js';
import { beosApi } from '../../lib/api/beos.api.js';
import { Alert } from '../ui/Alert.jsx';
import { Button } from '../ui/Button.jsx';
import '../ui/Table.css';
import { formatCurrency, formatDate } from '../../lib/utils/format.js';

const STATUS_LABEL = {
  BORRADOR: 'Borrador', EMITIDA: 'Emitida', PAGADA_PARCIAL: 'Pago parcial',
  PAGADA_TOTAL: 'Pagada', ANULADA: 'Anulada', VENCIDA: 'Vencida',
};
const STATUS_VARIANT = {
  BORRADOR: 'neutral', EMITIDA: 'warning', PAGADA_PARCIAL: 'warning',
  PAGADA_TOTAL: 'success', ANULADA: 'danger', VENCIDA: 'danger',
};
const NEXT_STATUSES = {
  BORRADOR: ['EMITIDA', 'ANULADA'],
  EMITIDA: ['VENCIDA', 'ANULADA'],
  PAGADA_PARCIAL: ['VENCIDA', 'ANULADA'],
  VENCIDA: ['EMITIDA'],
};
const PAYMENT_METHOD_LABEL = {
  TRANSFERENCIA: 'Transferencia', EFECTIVO: 'Efectivo',
  CHEQUE: 'Cheque', TARJETA: 'Tarjeta', OTRO: 'Otro',
};
const PAYMENT_TYPES = ['ANTICIPO', 'PAGO_PARCIAL', 'PAGO_TOTAL', 'AJUSTE'];
const PAYMENT_METHODS = ['TRANSFERENCIA', 'EFECTIVO', 'CHEQUE', 'TARJETA', 'OTRO'];
const STATUS_BUTTON_VARIANT = {
  EMITIDA: 'primary', PAGADA_TOTAL: 'primary', VENCIDA: 'secondary', ANULADA: 'danger',
};

const EMPTY_PAYMENT = {
  type: 'PAGO_PARCIAL',
  amount: '',
  paymentDate: new Date().toISOString().slice(0, 10),
  method: 'TRANSFERENCIA',
  reference: '',
  notes: '',
};


const BEO_CATEGORY_LABEL = { SALON: 'Montaje', AB: 'A&B', AV: 'AV', OTROS: 'Personal', EXTERNO: 'Externo' };
const BEO_STATUS_LABEL = { BORRADOR: 'Borrador', EMITIDO: 'Emitido', CONFIRMADO: 'Confirmado' };
const BEO_STATUS_VARIANT = { BORRADOR: 'neutral', EMITIDO: 'warning', CONFIRMADO: 'success' };

const DOC_TYPES = [
  { key: 'RETENCION', label: 'Certificados de retención' },
  { key: 'EVIDENCIA_FOTOGRAFICA', label: 'Evidencias fotográficas' },
  { key: 'EVIDENCIA_FACTURA', label: 'Evidencias de factura' },
];

export function InvoiceDetail({ id }) {
  const [invoice, setInvoice] = useState(null);
  const [beos, setBeos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payment, setPayment] = useState(EMPTY_PAYMENT);
  const [paymentFile, setPaymentFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await invoicesApi.getById(id);
      setInvoice(res.data);
      if (res.data?.event?.id) {
        const beoRes = await beosApi.getByEvent(res.data.event.id).catch(() => ({ data: [] }));
        setBeos(beoRes.data || []);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleStatusChange = async (newStatus) => {
    setError('');
    try {
      await invoicesApi.changeStatus(id, newStatus);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('type', payment.type);
      fd.append('amount', payment.amount);
      fd.append('paymentDate', payment.paymentDate);
      fd.append('method', payment.method);
      fd.append('reference', payment.reference);
      fd.append('notes', payment.notes);
      if (paymentFile) fd.append('file', paymentFile);
      await invoicesApi.addPayment(id, fd);
      setShowPaymentForm(false);
      setPayment(EMPTY_PAYMENT);
      setPaymentFile(null);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelPayment = async (paymentId) => {
    if (!confirm('¿Anular este pago?')) return;
    try {
      await invoicesApi.cancelPayment(id, paymentId);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <p className="text-muted">Cargando...</p>;
  if (!invoice) return <p className="text-muted">Factura no encontrada.</p>;

  const nextStatuses = NEXT_STATUSES[invoice.status] || [];
  const canAddPayment = ['EMITIDA', 'PAGADA_PARCIAL'].includes(invoice.status);

  return (
    <div className="page-container">
      <div className="page-filters">
        <div>
          <strong style={{ fontSize: 'var(--text-base)', color: 'var(--color-gold-dark)' }}>{invoice.number}</strong>
          <span className={`badge badge-${STATUS_VARIANT[invoice.status]}`} style={{ marginLeft: 'var(--space-2)' }}>
            {STATUS_LABEL[invoice.status]}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginLeft: 'auto' }}>
          {invoice.status === 'BORRADOR' && (
            <a href={`/facturas/${id}/editar`} className="btn btn--secondary btn--md">Editar</a>
          )}
          {nextStatuses.map((s) => (
            <Button key={s} variant={STATUS_BUTTON_VARIANT[s] || 'primary'} onClick={() => handleStatusChange(s)}>
              {STATUS_LABEL[s]}
            </Button>
          ))}
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="detail-grid">
        <div className="info-row"><span>Empresa</span><strong>{invoice.company?.name}</strong></div>
        <div className="info-row">
          <span>Evento</span>
          <strong>
            <a href={`/eventos/${invoice.event?.id}`} style={{ color: 'var(--color-primary)' }}>
              {invoice.event?.number} — {invoice.event?.name}
            </a>
          </strong>
        </div>
        <div className="info-row"><span>Fecha emisión</span><strong>{formatDate(invoice.issueDate)}</strong></div>
        {invoice.dueDate && <div className="info-row"><span>Vencimiento</span><strong>{formatDate(invoice.dueDate)}</strong></div>}
        {invoice.notes && <div className="info-row"><span>Notas</span><span>{invoice.notes}</span></div>}
      </div>

      {(invoice.quote || beos.length > 0) && (
        <div style={{ margin: 'var(--space-5) 0' }}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-3)' }}>
            Documentos relacionados
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {invoice.quote && (
              <a href={`/cotizaciones/${invoice.quote.id}`} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: 'var(--space-3) var(--space-4)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface)',
                textDecoration: 'none',
                color: 'var(--color-text)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cotización</span>
                  <strong style={{ color: 'var(--color-primary)' }}>{invoice.quote.number}</strong>
                </div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Ver →</span>
              </a>
            )}
            {beos.map(beo => (
              <a key={beo.id} href={`/eventos/${invoice.event?.id}?tab=beo`} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: 'var(--space-3) var(--space-4)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface)',
                textDecoration: 'none',
                color: 'var(--color-text)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Orden de servicio
                  </span>
                  <strong>{beo.number}</strong>
                  <span className="badge badge-neutral" style={{ fontSize: 'var(--text-xs)' }}>
                    {BEO_CATEGORY_LABEL[beo.category] || beo.category}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span className={`badge badge-${BEO_STATUS_VARIANT[beo.status] || 'neutral'}`} style={{ fontSize: 'var(--text-xs)' }}>
                    {BEO_STATUS_LABEL[beo.status] || beo.status}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Ver →</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="invoice-totals" style={{ maxWidth: 400, margin: 'var(--space-5) 0' }}>
        <div className="invoice-total-row"><span>Subtotal</span><strong>{formatCurrency(invoice.subtotal)}</strong></div>
        {invoice.tipAmount > 0 && (
          <div className="invoice-total-row"><span>Propina ({(invoice.tipRate || 0).toFixed(0)}%)</span><strong>{formatCurrency(invoice.tipAmount)}</strong></div>
        )}
        <div className="invoice-total-row"><span>IVA</span><strong>{formatCurrency(invoice.ivaAmount ?? invoice.taxAmount)}</strong></div>
        {invoice.icoAmount > 0 && (
          <div className="invoice-total-row"><span>ICO (8%)</span><strong>{formatCurrency(invoice.icoAmount)}</strong></div>
        )}
        <div className="invoice-total-row invoice-total-final"><span>Total</span><strong>{formatCurrency(invoice.total)}</strong></div>
        <div className="invoice-total-row" style={{ color: 'var(--color-success)' }}><span>Pagado</span><strong>{formatCurrency(invoice.paidAmount)}</strong></div>
        <div className="invoice-total-row" style={{ color: invoice.balance > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
          <span>Saldo</span><strong>{formatCurrency(invoice.balance)}</strong>
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-3)' }}>
          <h2 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>Pagos registrados</h2>
          {canAddPayment && !showPaymentForm && (
            <Button size="sm" onClick={() => setShowPaymentForm(true)}>
              + Registrar pago
            </Button>
          )}
        </div>

        {showPaymentForm && (
          <form onSubmit={handleAddPayment} className="payment-form">
            <div className="form-grid-2">
              <div className="input-field">
                <label className="input-label">Tipo</label>
                <select className="input-control" value={payment.type} onChange={(e) => setPayment((p) => ({ ...p, type: e.target.value }))}>
                  {PAYMENT_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="input-field">
                <label className="input-label">Monto <span className="input-required">*</span></label>
                <input className="input-control" type="number" min="0.01" step="0.01" value={payment.amount}
                  onChange={(e) => setPayment((p) => ({ ...p, amount: e.target.value }))} required />
              </div>
              <div className="input-field">
                <label className="input-label">Fecha</label>
                <input className="input-control" type="date" value={payment.paymentDate}
                  onChange={(e) => setPayment((p) => ({ ...p, paymentDate: e.target.value }))} required />
              </div>
              <div className="input-field">
                <label className="input-label">Método</label>
                <select className="input-control" value={payment.method} onChange={(e) => setPayment((p) => ({ ...p, method: e.target.value }))}>
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{PAYMENT_METHOD_LABEL[m]}</option>)}
                </select>
              </div>
              <div className="input-field">
                <label className="input-label">Referencia</label>
                <input className="input-control" type="text" value={payment.reference}
                  onChange={(e) => setPayment((p) => ({ ...p, reference: e.target.value }))} />
              </div>
              <div className="input-field">
                <label className="input-label">Comprobante (imagen o PDF)</label>
                <input className="input-control" type="file" accept="image/*,.pdf"
                  onChange={(e) => setPaymentFile(e.target.files[0] || null)} />
              </div>
            </div>
            <div className="input-field">
              <label className="input-label">Notas</label>
              <input className="input-control" type="text" value={payment.notes}
                onChange={(e) => setPayment((p) => ({ ...p, notes: e.target.value }))} />
            </div>
            <div className="form-actions">
              <Button type="button" variant="secondary" onClick={() => setShowPaymentForm(false)}>Cancelar</Button>
              <Button type="submit" loading={saving}>Registrar</Button>
            </div>
          </form>
        )}

        {invoice.payments.length === 0 ? (
          <p className="text-muted">Sin pagos registrados.</p>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr><th>Tipo</th><th>Fecha</th><th>Método</th><th>Referencia</th><th>Monto</th><th>Comprobante</th><th>Estado</th><th></th></tr>
              </thead>
              <tbody>
                {invoice.payments.map((p) => (
                  <tr key={p.id} style={{ opacity: p.status === 'ANULADO' ? 0.5 : 1 }}>
                    <td>{p.type?.replace('_', ' ')}</td>
                    <td>{formatDate(p.paymentDate)}</td>
                    <td>{PAYMENT_METHOD_LABEL[p.method]}</td>
                    <td>{p.reference || '—'}</td>
                    <td>{formatCurrency(p.amount)}</td>
                    <td>
                      {p.file ? (
                        <a href={p.file} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>Ver</a>
                      ) : '—'}
                    </td>
                    <td><span className={`badge badge-${p.status === 'ANULADO' ? 'danger' : 'success'}`}>{p.status}</span></td>
                    <td>
                      {p.status !== 'ANULADO' && (
                        <button className="link-btn" style={{ color: 'var(--color-danger)' }} onClick={() => handleCancelPayment(p.id)}>
                          Anular
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop: 'var(--space-6)' }}>
        <h2 style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--text-lg)' }}>Documentos</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {DOC_TYPES.map(({ key, label }) => {
            const docs = (invoice.documents || []).filter(d => d.type === key);
            return (
              <DocSection
                key={key}
                label={label}
                docType={key}
                docs={docs}
                invoiceId={id}
                onReload={load}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DocSection({ label, docType, docs, invoiceId, onReload }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', docType);
      await invoicesApi.addDocument(invoiceId, fd);
      setFile(null);
      await onReload();
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (docId) => {
    if (!confirm(`¿Eliminar este documento?`)) return;
    try {
      await invoicesApi.removeDocument(invoiceId, docId);
      await onReload();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)' }}>{label}</span>
        {docs.length > 0 && (
          <span className="badge badge-neutral">{docs.length}</span>
        )}
      </div>
      <div style={{ padding: 'var(--space-4)' }}>
        {error && <p style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>{error}</p>}
        {docs.length === 0 && <p className="text-muted" style={{ marginBottom: 'var(--space-3)' }}>Sin documentos cargados.</p>}
        {docs.length > 0 && (
          <div className="table-wrapper" style={{ marginBottom: 'var(--space-3)' }}>
            <table className="table">
              <thead>
                <tr><th>Archivo</th><th>Fecha</th><th></th></tr>
              </thead>
              <tbody>
                {docs.map(d => (
                  <tr key={d.id}>
                    <td>
                      <a href={d.file} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>
                        {d.filename || 'Ver archivo'}
                      </a>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
                      {d.createdAt ? new Date(d.createdAt).toLocaleDateString('es-CO') : '—'}
                    </td>
                    <td>
                      <button className="link-btn" style={{ color: 'var(--color-danger)' }} onClick={() => handleRemove(d.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            className="input-control"
            type="file"
            accept="image/*,.pdf"
            style={{ flex: 1, minWidth: 200 }}
            onChange={e => setFile(e.target.files[0] || null)}
          />
          <Button size="sm" variant="secondary" disabled={!file || uploading} loading={uploading} onClick={handleUpload}>
            Subir
          </Button>
        </div>
      </div>
    </div>
  );
}
