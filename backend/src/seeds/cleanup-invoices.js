import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { Invoice } from '../modules/invoices/invoice.model.js';

async function cleanup() {
  await mongoose.connect(env.MONGO_URI);
  console.log('Conectado a MongoDB...\n');

  const count = await Invoice.countDocuments();
  console.log(`Facturas encontradas: ${count}`);

  if (count === 0) {
    console.log('No hay facturas para eliminar.');
    await mongoose.disconnect();
    return;
  }

  const result = await Invoice.deleteMany({});
  console.log(`Facturas eliminadas: ${result.deletedCount}`);

  await mongoose.disconnect();
  console.log('\nDesconectado. Limpieza finalizada.');
}

cleanup().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
