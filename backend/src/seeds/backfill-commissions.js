import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { Event } from '../modules/events/event.model.js';
import { Commission } from '../modules/commissions/commission.model.js';

async function backfill() {
  await mongoose.connect(env.MONGO_URI);
  console.log('Conectado a MongoDB...\n');

  const events = await Event.find({ active: true }).select('_id number name ownerId');
  console.log(`Eventos encontrados: ${events.length}\n`);

  let created = 0;
  let skipped = 0;

  for (const event of events) {
    const existing = await Commission.findOne({ eventId: event._id, active: true });
    if (existing) {
      console.log(`  SKIP  ${event.number} — ya tiene comisión ${existing.number}`);
      skipped++;
      continue;
    }

    const com = await Commission.create({
      eventId: event._id,
      beneficiaryId: event.ownerId || undefined,
      beneficiaryType: 'EJECUTIVO_COMERCIAL',
      baseAmount: 0,
      rate: 0.03,
      createdBy: event.ownerId || undefined,
    });

    console.log(`  CREADA ${event.number} → ${com.number}`);
    created++;
  }

  console.log(`\nComisiones creadas : ${created}`);
  console.log(`Eventos omitidos   : ${skipped} (ya tenían comisión)`);
  await mongoose.disconnect();
  console.log('Desconectado. Backfill finalizado.');
}

backfill().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
