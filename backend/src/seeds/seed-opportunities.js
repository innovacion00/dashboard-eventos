import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from '../config/env.js';

await mongoose.connect(env.MONGO_URI);
console.log('Conectado a MongoDB...');

const db = mongoose.connection;

// Obtener todas las empresas activas
const companies = await db.collection('companies').find({ active: true }).toArray();
console.log(`Empresas encontradas: ${companies.length}`);

// Obtener companyIds que ya tienen oportunidad
const existingOpps = await db.collection('opportunities').distinct('companyId', { active: true });
const existingSet = new Set(existingOpps.map((id) => id.toString()));

// Filtrar empresas sin oportunidad
const pending = companies.filter((c) => !existingSet.has(c._id.toString()));
console.log(`Empresas sin oportunidad: ${pending.length}`);

if (pending.length === 0) {
  console.log('Todas las empresas ya tienen oportunidad. Nada que hacer.');
  await mongoose.disconnect();
  process.exit(0);
}

// Crear docs en lotes de 500
const BATCH = 500;
let created = 0;
const now = new Date();

for (let i = 0; i < pending.length; i += BATCH) {
  const batch = pending.slice(i, i + BATCH);
  const docs = batch.map((company) => ({
    companyId: company._id,
    ownerId: company.ownerId,
    stage: 'PROSPECTO_INICIAL',
    probability: 10,
    estimatedValue: 0,
    weightedValue: 0,
    active: true,
    createdAt: now,
    updatedAt: now,
  }));

  await db.collection('opportunities').insertMany(docs, { ordered: false });
  created += docs.length;
  console.log(`  Lote ${Math.floor(i / BATCH) + 1}: ${created} oportunidades creadas`);
}

console.log(`\nMigración completada: ${created} oportunidades creadas.`);
await mongoose.disconnect();
