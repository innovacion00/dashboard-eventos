import { useState, useEffect } from 'react';
import { dashboardApi } from '../../lib/api/dashboard.api.js';
import { KPICard } from './KPICard.jsx';
import { Alert } from '../ui/Alert.jsx';
import { formatCurrency, formatDate, formatPercent } from '../../lib/utils/format.js';
import './DashboardPanel.css';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const STAGE_LABELS = {
  PROSPECTO_INICIAL: 'Prospecto', CALIFICADO: 'Calificado',
  VISITA_INSPECCION: 'Visita', COTIZADO: 'Cotizado',
  NEGOCIACION: 'Negociación', APROBADO_PENDIENTE_PAGO: 'Aprobado',
  CONFIRMADO: 'Confirmado', PERDIDO: 'Perdido',
};

export function DashboardPanel() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.snapshot({ year, month });
      setData(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [year, month]);

  const progressPct = data?.goal?.revenueTarget
    ? Math.min(100, Math.round((data.sales.confirmedSales / data.goal.revenueTarget) * 100))
    : 0;

  return (
    <div className="page-container">
      <div className="page-filters">
        <select className="input-control" value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ maxWidth: 90 }}>
          {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <select className="input-control" value={month} onChange={(e) => setMonth(Number(e.target.value))} style={{ maxWidth: 140 }}>
          {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
        </select>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {loading ? (
        <p className="text-muted">Cargando datos...</p>
      ) : data ? (
        <>
          {/* Alertas activas */}
          {data.alerts.presaleAlert && (
            <div className="dashboard-alert">
              Pipeline ponderado insuficiente: el pipeline no cubre el 60% de la meta. Se requiere más actividad comercial.
            </div>
          )}
          {data.alerts.overdueTasksCount > 0 && (
            <div className="dashboard-alert dashboard-alert--warning">
              Hay {data.alerts.overdueTasksCount} tarea(s) vencida(s).
            </div>
          )}

          {/* KPIs principales */}
          <div className="kpi-grid">
            <KPICard
              label="Ventas confirmadas"
              value={formatCurrency(data.sales.confirmedSales)}
              sub={`Meta: ${formatCurrency(data.goal?.revenueTarget)}`}
              alert={data.alerts.presaleAlert ? 'Alerta de preventa activa' : null}
            />
            <KPICard
              label="Pipeline total"
              value={formatCurrency(data.sales.pipelineTotal)}
              sub={`Ponderado: ${formatCurrency(data.sales.pipelineWeighted)}`}
            />
            <KPICard
              label="Brecha"
              value={formatCurrency(data.sales.gap)}
              sub={`Cobertura: ${data.sales.coverage != null ? (data.sales.coverage * 100).toFixed(0) + '%' : 'Total'}`}
              variant={data.sales.gap === 0 ? 'success' : 'default'}
            />
            <KPICard
              label="Ticket promedio"
              value={formatCurrency(data.sales.averageTicket)}
              sub={`${data.sales.confirmedEventsCount} evento(s) confirmado(s)`}
            />
            <KPICard label="Tareas pendientes" value={data.tasks.pending} sub={`${data.tasks.overdue} vencida(s)`} alert={data.tasks.overdue > 0 ? 'Revisar tareas vencidas' : null} />
            <KPICard label="Oportunidades vencidas" value={data.alerts.overdueOpportunitiesCount} alert={data.alerts.overdueOpportunitiesCount > 0 ? 'Requieren atención' : null} />
          </div>

          {/* Barra de progreso vs meta */}
          {data.goal && (
            <div className="progress-section">
              <div className="progress-header">
                <span>Avance vs. meta de ingresos</span>
                <span><strong>{progressPct}%</strong></span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          )}

          <div className="dashboard-grid-2">
            {/* Oportunidades vencidas */}
            {data.overdueOpportunities.length > 0 && (
              <section className="dashboard-section">
                <h2 className="section-title">Oportunidades vencidas</h2>
                <ul className="dashboard-list">
                  {data.overdueOpportunities.map((o) => (
                    <li key={o._id} className="dashboard-list-item">
                      <div>
                        <strong>{o.companyId?.name || '—'}</strong> — {o.eventType}
                        <span className="badge badge-neutral" style={{ marginLeft: 'var(--space-2)' }}>{STAGE_LABELS[o.stage]}</span>
                      </div>
                      <span className="text-danger">{formatDate(o.nextActionAt)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Actividades recientes */}
            <section className="dashboard-section">
              <h2 className="section-title">Actividades recientes</h2>
              {data.recentActivities.length === 0 ? (
                <p className="text-muted">Sin actividades en los últimos 30 días.</p>
              ) : (
                <ul className="dashboard-list">
                  {data.recentActivities.slice(0, 10).map((a) => (
                    <li key={a._id} className="dashboard-list-item">
                      <div>
                        <strong>{a.companyId?.name || '—'}</strong> — {a.type}
                        <span className="text-muted" style={{ marginLeft: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>{a.ownerId?.name}</span>
                      </div>
                      <span className="text-muted">{formatDate(a.date)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Ventas históricas por ejecutivo */}
          {data.historicalSales && data.historicalSales.length > 0 && (
            <section className="dashboard-section" style={{ marginTop: 'var(--space-4)' }}>
              <h2 className="section-title">Ventas históricas por ejecutivo — {MONTHS[month - 1]} {year}</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                <thead>
                  <tr style={{ background: 'var(--color-gray-1)' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 'var(--font-semibold)', borderBottom: '1px solid var(--color-border)' }}>Ejecutivo</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 'var(--font-semibold)', borderBottom: '1px solid var(--color-border)' }}>Ventas confirmadas</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 'var(--font-semibold)', borderBottom: '1px solid var(--color-border)' }}>Eventos</th>
                  </tr>
                </thead>
                <tbody>
                  {data.historicalSales.map((h, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '8px 12px' }}>{h.executiveName}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 'var(--font-semibold)' }}>{formatCurrency(h.confirmedSales)}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>{h.confirmedEvents}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: 'var(--color-gold-subtle)' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 'var(--font-bold)' }}>Total</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 'var(--font-bold)' }}>{formatCurrency(data.historicalTotal)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 'var(--font-bold)' }}>{data.historicalSales.reduce((s, h) => s + (h.confirmedEvents || 0), 0)}</td>
                  </tr>
                </tfoot>
              </table>
            </section>
          )}
        </>
      ) : (
        <p className="text-muted">No hay datos para este período.</p>
      )}
    </div>
  );
}
