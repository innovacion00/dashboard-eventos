import { useState, useEffect } from 'react';
import { authApi } from '../../lib/api/auth.api.js';
import { getUser } from '../../lib/auth/session.js';
import './DashboardWelcome.css';

export function DashboardWelcome() {
  const [user, setUser] = useState(getUser());
  const [loading, setLoading] = useState(!user);

  useEffect(() => {
    if (!user) {
      authApi.me()
        .then((res) => setUser(res.data))
        .catch(() => { window.location.href = '/login'; })
        .finally(() => setLoading(false));
    }
  }, []);

  if (loading) {
    return <div className="dashboard-welcome dashboard-welcome--loading">Cargando...</div>;
  }

  const roleLabels = {
    DIRECCION_GENERAL: 'Dirección General',
    GERENCIA_HOTEL: 'Gerencia del Hotel',
    LIDER_COMERCIAL: 'Líder Comercial',
    EJECUTIVO_COMERCIAL: 'Ejecutivo Comercial',
    COORDINACION_OPERATIVA: 'Coordinación Operativa',
    FINANCIERO: 'Financiero / Cartera',
    CALIDAD: 'Calidad / Experiencia',
    ADMINISTRADOR: 'Administrador',
  };

  return (
    <div className="dashboard-welcome">
      <h1 className="dashboard-welcome-title">
        Bienvenido, {user?.name}
      </h1>
      <p className="dashboard-welcome-role">{roleLabels[user?.role] || user?.role}</p>
      <p className="dashboard-welcome-hint">
        El dashboard con KPIs en tiempo real estará disponible al completar la Fase 1.
      </p>
    </div>
  );
}
