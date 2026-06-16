import { useState, useEffect } from 'react';
import { companiesApi } from '../../lib/api/companies.api.js';
import { contactsApi } from '../../lib/api/contacts.api.js';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Modal } from '../ui/Modal.jsx';
import { CompanyForm } from './CompanyForm.jsx';
import { ContactForm } from './ContactForm.jsx';
import { ActivityForm } from '../activities/ActivityForm.jsx';
import { formatDate, formatCurrency } from '../../lib/utils/format.js';

const STATUS_LABELS = {
  PROSPECTO: 'Prospecto', CLIENTE_ACTIVO: 'Cliente activo', CLIENTE_INACTIVO: 'Cliente inactivo',
  ALIADO: 'Aliado', AGENCIA: 'Agencia', GUBERNAMENTAL: 'Gubernamental',
};

export function CompanyDetail({ companyId }) {
  const [company, setCompany] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [modal, setModal] = useState(null); // 'edit' | 'contact' | 'activity'

  const load = async () => {
    try {
      setLoading(true);
      const [compRes, conRes, actRes, oppRes] = await Promise.all([
        companiesApi.getById(companyId),
        companiesApi.listContacts(companyId),
        companiesApi.listActivities(companyId),
        companiesApi.listOpportunities(companyId),
      ]);
      setCompany(compRes.data);
      setContacts(conRes.data);
      setActivities(actRes.data);
      setOpportunities(oppRes.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [companyId]);

  const handleDeleteContact = async (contactId) => {
    if (!confirm('¿Eliminar este contacto?')) return;
    try {
      await contactsApi.remove(contactId);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <div className="page-loading">Cargando...</div>;
  if (!company) return <Alert type="error" message="Empresa no encontrada" />;

  return (
    <div className="page-container">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="page-header">
        <div>
          <h1 className="page-title">{company.name}</h1>
          <span className="badge badge-neutral">{STATUS_LABELS[company.status] || company.status}</span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="secondary" onClick={() => setModal('activity')}>Registrar actividad</Button>
          <Button variant="secondary" onClick={() => setModal('contact')}>Nuevo contacto</Button>
          <Button onClick={() => setModal('edit')}>Editar empresa</Button>
        </div>
      </div>

      <div className="tabs">
        {['info', 'contactos', 'actividades', 'oportunidades'].map((tab) => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'tab-btn--active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <div className="detail-grid">
          <InfoRow label="Segmento" value={company.segment} />
          <InfoRow label="NIT / RUT" value={company.taxId} />
          <InfoRow label="Ciudad" value={company.location?.city} />
          <InfoRow label="País" value={company.location?.country} />
          <InfoRow label="Potencial estimado" value={formatCurrency(company.estimatedPotential)} />
          <InfoRow label="Responsable" value={company.owner?.name} />
          <InfoRow label="Último contacto" value={formatDate(company.lastContactAt)} />
          <InfoRow label="Próxima acción" value={formatDate(company.nextActionAt)} />
          <InfoRow label="Descripción próxima acción" value={company.nextActionDescription} />
        </div>
      )}

      {activeTab === 'contactos' && (
        <div>
          {contacts.length === 0 ? <p className="text-muted">Sin contactos registrados.</p> : (
            <ul className="contact-list">
              {contacts.map((c) => (
                <li key={c._id} className="contact-item">
                  <div>
                    <strong>{c.fullName}</strong> — {c.position}
                    {c.email && <span> · {c.email}</span>}
                    {c.phone && <span> · {c.phone}</span>}
                  </div>
                  <button className="link-btn link-btn--danger" onClick={() => handleDeleteContact(c._id)}>Eliminar</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {activeTab === 'actividades' && (
        <div>
          {activities.length === 0 ? <p className="text-muted">Sin actividades registradas.</p> : (
            <ul className="activity-list">
              {activities.map((a) => (
                <li key={a._id} className="activity-item">
                  <div className="activity-date">{formatDate(a.date)}</div>
                  <div className="activity-content">
                    <strong>{a.type}</strong>
                    <p>{a.result}</p>
                    {a.nextActionDescription && <p className="text-muted">Próxima acción: {a.nextActionDescription} ({formatDate(a.nextActionAt)})</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {activeTab === 'oportunidades' && (
        <div>
          {opportunities.length === 0 ? <p className="text-muted">Sin oportunidades registradas.</p> : (
            <ul className="opportunity-list">
              {opportunities.map((o) => (
                <li key={o._id} className="opportunity-item">
                  <a href={`/pipeline/${o._id}`}><strong>{o.eventType}</strong></a>
                  <span className="badge badge-stage">{o.stage}</span>
                  <span>{formatCurrency(o.estimatedValue)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Modal open={modal === 'edit'} title="Editar empresa" onClose={() => setModal(null)}>
        <CompanyForm initial={company} onSaved={() => { setModal(null); load(); }} onCancel={() => setModal(null)} />
      </Modal>

      <Modal open={modal === 'contact'} title="Nuevo contacto" onClose={() => setModal(null)} size="sm">
        <ContactForm companyId={companyId} onSaved={() => { setModal(null); load(); }} onCancel={() => setModal(null)} />
      </Modal>

      <Modal open={modal === 'activity'} title="Registrar actividad" onClose={() => setModal(null)}>
        <ActivityForm companyId={companyId} onSaved={() => { setModal(null); load(); }} onCancel={() => setModal(null)} />
      </Modal>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value || '—'}</span>
    </div>
  );
}
