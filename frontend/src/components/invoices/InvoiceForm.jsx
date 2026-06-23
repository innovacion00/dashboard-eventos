import { useState, useEffect } from 'react';
import { invoicesApi } from '../../lib/api/invoices.api.js';
import { eventsApi } from '../../lib/api/events.api.js';
import { companiesApi } from '../../lib/api/companies.api.js';
import { quotesApi } from '../../lib/api/quotes.api.js';
import { Alert } from '../ui/Alert.jsx';

const EMPTY = {
  eventId: '',
  companyId: '',
  quoteId: '',
  subtotal: '',
  taxRate: '0.19',
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: '',
  notes: '',
};

export function InvoiceForm({ invoiceId }) {
  const [form, setForm] = useState(EMPTY);
  const [events, setEvents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      eventsApi.list({ limit: 200 }),
      companiesApi.list({ limit: 200 }),
    ]).then(([ev, co]) => {
      setEvents(ev.data || []);
      setCompanies(co.data || []);
    }).catch((e) => setError(e.message));

    if (invoiceId) {
      invoicesApi.getById(invoiceId).then((res) => {
        const d = res.data;
        setForm({
          eventId: d.event?.id || '',
          companyId: d.company?.id || '',
          quoteId: d.quote?.id || '',
          subtotal: String(d.subtotal),
          taxRate: String(d.taxRate),
          issueDate: d.issueDate ? d.issueDate.slice(0, 10) : '',
          dueDate: d.dueDate ? d.dueDate.slice(0, 10) : '',
          notes: d.notes || '',
        });
      }).catch((e) => setError(e.message));
    }
  }, [invoiceId]);

  useEffect(() => {
    if (!form.companyId) { setQuotes([]); return; }
    companiesApi.listOpportunities(form.companyId).catch(() => []).then(() => {});
    quotesApi.list({ companyId: form.companyId, limit: 100 }).then((res) => {
      setQuotes((res.data || []).filter((q) => q.status === 'APROBADA'));
    }).catch(() => setQuotes([]));
  }, [form.companyId]);

  const handleEventChange = (eventId) => {
    const ev = events.find((e) => e.id === eventId);
    setForm((f) => ({
      ...f,
      eventId,
      companyId: ev?.company?.id || f.companyId,
      subtotal: ev ? String(ev.totalValue || '') : f.subtotal,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        eventId: form.eventId,
        companyId: form.companyId,
        quoteId: form.quoteId || undefined,
        subtotal: parseFloat(form.subtotal),
        taxRate: parseFloat(form.taxRate),
        issueDate: form.issueDate || undefined,
        dueDate: form.dueDate || undefined,
        notes: form.notes || undefined,
      };
      if (invoiceId) {
        await invoicesApi.update(invoiceId, payload);
      } else {
        await invoicesApi.create(payload);
      }
      window.location.href = '/facturas';
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const subtotal = parseFloat(form.subtotal) || 0;
  const taxRate = parseFloat(form.taxRate) || 0;
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const total = Math.round((subtotal + taxAmount) * 100) / 100;

  return (
    <div className="page-container">
      <div className="page-filters">
        <a href="/facturas" className="btn btn-secondary" style={{ marginLeft: 'auto' }}>Cancelar</a>
      </div>
{error && <Alert type="error" message={error} onClose={() => setError('')} />}
      <form onSubmit={handleSubmit} style={{ maxWidth: 680 }}>
        <div className="form-grid-2">
          <div className="input-field">
            <label className="input-label">Evento <span className="input-required">*</span></label>
            <select className="select-field" value={form.eventId} onChange={(e) => handleEventChange(e.target.value)} required>
              <option value="">Seleccionar evento</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.number} — {ev.name}</option>
              ))}
            </select>
          </div>
          <div className="input-field">
            <label className="input-label">Empresa <span className="input-required">*</span></label>
            <select className="select-field" value={form.companyId} onChange={(e) => setForm((f) => ({ ...f, companyId: e.target.value }))} required>
              <option value="">Seleccionar empresa</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          {quotes.length > 0 && (
            <div className="input-field">
              <label className="input-label">Cotización aprobada</label>
              <select className="select-field" value={form.quoteId} onChange={(e) => setForm((f) => ({ ...f, quoteId: e.target.value }))}>
                <option value="">Sin cotización vinculada</option>
                {quotes.map((q) => (
                  <option key={q.id} value={q.id}>{q.number} — ${q.total?.toLocaleString('es-CO')}</option>
                ))}
              </select>
            </div>
          )}
          <div className="input-field">
            <label className="input-label">Subtotal <span className="input-required">*</span></label>
            <input className="input" type="number" min="0" step="0.01" value={form.subtotal}
              onChange={(e) => setForm((f) => ({ ...f, subtotal: e.target.value }))} required />
          </div>
          <div className="input-field">
            <label className="input-label">IVA (%)</label>
            <input className="input" type="number" min="0" max="100" step="0.01"
              value={(parseFloat(form.taxRate) * 100).toFixed(0)}
              onChange={(e) => setForm((f) => ({ ...f, taxRate: String(parseFloat(e.target.value) / 100) }))} />
          </div>
          <div className="input-field">
            <label className="input-label">Fecha de emisión</label>
            <input className="input" type="date" value={form.issueDate}
              onChange={(e) => setForm((f) => ({ ...f, issueDate: e.target.value }))} />
          </div>
          <div className="input-field">
            <label className="input-label">Fecha de vencimiento</label>
            <input className="input" type="date" value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
          </div>
        </div>
        <div className="input-field">
          <label className="input-label">Notas</label>
          <textarea className="input" rows={3} value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        </div>
        <div className="invoice-totals">
          <div className="invoice-total-row"><span>Subtotal</span><strong>${subtotal.toLocaleString('es-CO')}</strong></div>
          <div className="invoice-total-row"><span>IVA ({(taxRate * 100).toFixed(0)}%)</span><strong>${taxAmount.toLocaleString('es-CO')}</strong></div>
          <div className="invoice-total-row invoice-total-final"><span>Total</span><strong>${total.toLocaleString('es-CO')}</strong></div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando...' : invoiceId ? 'Actualizar' : 'Crear factura'}
          </button>
        </div>
      </form>
    </div>
  );
}
