import './KPICard.css';

export function KPICard({ label, value, sub, alert, variant = 'default' }) {
  return (
    <div className={`kpi-card kpi-card--${variant} ${alert ? 'kpi-card--alert' : ''}`}>
      <p className="kpi-label">{label}</p>
      <p className="kpi-value">{value ?? '—'}</p>
      {sub && <p className="kpi-sub">{sub}</p>}
      {alert && <p className="kpi-alert-msg">{alert}</p>}
    </div>
  );
}
