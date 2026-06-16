import { useState } from 'react';
import { opportunitiesApi } from '../../lib/api/opportunities.api.js';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';

const STAGES = [
  { value: 'PROSPECTO_INICIAL', label: 'Prospecto inicial', probability: 10 },
  { value: 'CALIFICADO', label: 'Calificado', probability: 20 },
  { value: 'VISITA_INSPECCION', label: 'Visita / Inspección', probability: 35 },
  { value: 'COTIZADO', label: 'Cotizado', probability: 50 },
  { value: 'NEGOCIACION', label: 'Negociación', probability: 70 },
  { value: 'APROBADO_PENDIENTE_PAGO', label: 'Aprobado, pendiente pago', probability: 90 },
  { value: 'CONFIRMADO', label: 'Confirmado', probability: 100 },
  { value: 'PERDIDO', label: 'Perdido', probability: 0 },
];

export function StageSelector({ opportunity, onSaved, onCancel }) {
  const [stage, setStage] = useState(opportunity.stage);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (stage === opportunity.stage) { onCancel(); return; }
    try {
      setLoading(true);
      setApiError('');
      await opportunitiesApi.changeStage(opportunity.id, stage);
      onSaved();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selected = STAGES.find((s) => s.value === stage);

  return (
    <form onSubmit={handleSubmit}>
      {apiError && <Alert type="error" message={apiError} onClose={() => setApiError('')} />}
      <p style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
        Selecciona la nueva etapa. La probabilidad y el valor ponderado se recalcularán automáticamente.
      </p>
      <div className="stage-list">
        {STAGES.map((s) => (
          <button
            key={s.value}
            type="button"
            className={`stage-option ${stage === s.value ? 'stage-option--active' : ''}`}
            onClick={() => setStage(s.value)}
          >
            <span className="stage-label">{s.label}</span>
            <span className="stage-prob">{s.probability}%</span>
          </button>
        ))}
      </div>
      {selected && (
        <p style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          Probabilidad seleccionada: <strong>{selected.probability}%</strong>
        </p>
      )}
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>Confirmar cambio</Button>
      </div>
    </form>
  );
}
