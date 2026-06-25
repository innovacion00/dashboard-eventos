import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { Catalog } from '../modules/catalogs/catalog.model.js';

const SEGMENTS = [
  { code: 'CORPORATIVO', label: 'Corporativo' },
  { code: 'GOBIERNO', label: 'Gobierno' },
  { code: 'SOCIAL', label: 'Social' },
  { code: 'BODAS', label: 'Bodas' },
  { code: 'EDUCATIVO', label: 'Educativo' },
  { code: 'SALUD', label: 'Salud' },
  { code: 'TECNOLOGIA', label: 'Tecnología' },
  { code: 'FINANCIERO', label: 'Financiero' },
  { code: 'INMOBILIARIO', label: 'Inmobiliario' },
  { code: 'MEDIOS', label: 'Medios y comunicación' },
  { code: 'ONG', label: 'ONG / Fundaciones' },
  { code: 'DEPORTIVO', label: 'Deportivo' },
  { code: 'GASTRONOMICO', label: 'Gastronómico' },
  { code: 'MODA', label: 'Moda y belleza' },
  { code: 'JURIDICO', label: 'Jurídico' },
  { code: 'OTRO_SEGMENTO', label: 'Otro' },
].map((item, i) => ({ type: 'SEGMENT', ...item, order: i + 1 }));

const EVENT_TYPES = [
  { code: 'SERVICIO_SOCIAL', label: 'Servicio social' },
  { code: 'SERVICIO_CORPORATIVO', label: 'Servicio corporativo' },
].map((item, i) => ({ type: 'EVENT_TYPE', ...item, order: i + 1 }));

const ACTIVITY_TYPES = [
  { code: 'LLAMADA', label: 'Llamada telefónica' },
  { code: 'CORREO', label: 'Correo electrónico' },
  { code: 'MENSAJE', label: 'Mensaje (WhatsApp / SMS)' },
  { code: 'VISITA', label: 'Visita presencial' },
  { code: 'INSPECCION', label: 'Inspección de instalaciones' },
  { code: 'REUNION', label: 'Reunión' },
  { code: 'ENVIO_PORTAFOLIO', label: 'Envío de portafolio' },
  { code: 'ENVIO_TARIFAS', label: 'Envío de tarifas' },
  { code: 'SEGUIMIENTO', label: 'Seguimiento' },
  { code: 'REGISTRO_PROVEEDOR', label: 'Registro ante proveedores institucionales' },
  { code: 'PRESENTACION', label: 'Presentación institucional' },
  { code: 'GESTION_PUBLICA', label: 'Gestión en procesos públicos' },
  { code: 'FERIA', label: 'Participación en ferias' },
  { code: 'OTRO_ACTIVIDAD', label: 'Otro' },
].map((item, i) => ({ type: 'ACTIVITY_TYPE', ...item, order: i + 1 }));

const ORIGINS = [
  { code: 'REFERIDO', label: 'Referido' },
  { code: 'WEB', label: 'Sitio web' },
  { code: 'REDES_SOCIALES', label: 'Redes sociales' },
  { code: 'LLAMADA_FRIA', label: 'Llamada en frío' },
  { code: 'FERIA', label: 'Feria o evento' },
  { code: 'ALIADO', label: 'Aliado comercial' },
  { code: 'AGENCIA', label: 'Agencia' },
  { code: 'CLIENTE_RECURRENTE', label: 'Cliente recurrente' },
  { code: 'OTRO_ORIGEN', label: 'Otro' },
].map((item, i) => ({ type: 'ORIGIN', ...item, order: i + 1 }));

const COMPANY_STATUSES = [
  { code: 'PROSPECTO', label: 'Prospecto' },
  { code: 'CLIENTE_ACTIVO', label: 'Cliente activo' },
  { code: 'CLIENTE_INACTIVO', label: 'Cliente inactivo' },
  { code: 'ALIADO', label: 'Aliado' },
  { code: 'AGENCIA', label: 'Agencia' },
  { code: 'GUBERNAMENTAL', label: 'Gubernamental' },
].map((item, i) => ({ type: 'COMPANY_STATUS', ...item, order: i + 1 }));

const STAGE_ITEMS = [
  { code: 'PROSPECTO_INICIAL', label: 'Prospecto inicial', metadata: { probability: 10 } },
  { code: 'CALIFICADO', label: 'Calificado', metadata: { probability: 20 } },
  { code: 'VISITA_INSPECCION', label: 'Visita / Inspección', metadata: { probability: 35 } },
  { code: 'COTIZADO', label: 'Cotizado', metadata: { probability: 50 } },
  { code: 'NEGOCIACION', label: 'Negociación', metadata: { probability: 70 } },
  { code: 'APROBADO_PENDIENTE_PAGO', label: 'Aprobado, pendiente de pago', metadata: { probability: 90 } },
  { code: 'CONFIRMADO', label: 'Confirmado', metadata: { probability: 100 } },
  { code: 'PERDIDO', label: 'Perdido', metadata: { probability: 0 } },
].map((item, i) => ({ type: 'STAGE', ...item, order: i + 1 }));

const ALL_CATALOGS = [
  ...SEGMENTS,
  ...EVENT_TYPES,
  ...ACTIVITY_TYPES,
  ...ORIGINS,
  ...COMPANY_STATUSES,
  ...STAGE_ITEMS,
];

async function seed() {
  await mongoose.connect(env.MONGO_URI);
  console.log('Conectado a MongoDB para sembrar catálogos...');

  const deleted = await Catalog.deleteMany({ type: 'EVENT_TYPE' });
  console.log(`Tipos de evento anteriores eliminados: ${deleted.deletedCount}`);

  let created = 0;
  let skipped = 0;

  for (const item of ALL_CATALOGS) {
    const exists = await Catalog.findOne({ type: item.type, code: item.code });
    if (exists) {
      skipped++;
      continue;
    }
    await Catalog.create(item);
    created++;
  }

  console.log(`Catálogos sembrados: ${created} creados, ${skipped} ya existían.`);
  await mongoose.disconnect();
  console.log('Desconectado de MongoDB.');
}

seed().catch((err) => {
  console.error('Error en seed de catálogos:', err);
  process.exit(1);
});
