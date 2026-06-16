export const STAGES = {
  PROSPECTO_INICIAL: {
    code: 'PROSPECTO_INICIAL',
    label: 'Prospecto inicial',
    probability: 10,
  },
  CALIFICADO: {
    code: 'CALIFICADO',
    label: 'Calificado',
    probability: 20,
  },
  VISITA_INSPECCION: {
    code: 'VISITA_INSPECCION',
    label: 'Visita / Inspección',
    probability: 35,
  },
  COTIZADO: {
    code: 'COTIZADO',
    label: 'Cotizado',
    probability: 50,
  },
  NEGOCIACION: {
    code: 'NEGOCIACION',
    label: 'Negociación',
    probability: 70,
  },
  APROBADO_PENDIENTE_PAGO: {
    code: 'APROBADO_PENDIENTE_PAGO',
    label: 'Aprobado, pendiente de pago',
    probability: 90,
  },
  CONFIRMADO: {
    code: 'CONFIRMADO',
    label: 'Confirmado',
    probability: 100,
  },
  PERDIDO: {
    code: 'PERDIDO',
    label: 'Perdido',
    probability: 0,
  },
};

export const STAGE_CODES = Object.keys(STAGES);
