import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { Invoice } from '../modules/invoices/invoice.model.js';
import { Quote } from '../modules/quotes/quote.model.js';

async function backfill() {
  await mongoose.connect(env.MONGO_URI);
  console.log('Conectado a MongoDB...\n');

  const invoices = await Invoice.find({ active: true });
  console.log(`Facturas encontradas: ${invoices.length}\n`);

  let updated = 0;

  for (const inv of invoices) {
    if (inv.ivaAmount > 0 || inv.icoAmount > 0) continue;

    if (inv.quoteId) {
      const quote = await Quote.findById(inv.quoteId);
      if (quote && quote.subtotal > 0) {
        inv.ivaAmount = quote.ivaAmount || 0;
        inv.icoAmount = quote.icoAmount || 0;

        const tipItem = (quote.items || []).find(i => i.description === 'Propina' && i.category === 'AB');
        if (tipItem) {
          inv.tipAmount = tipItem.total || tipItem.unitPrice || 0;
          const abBase = (quote.items || [])
            .filter(i => i.category === 'AB' && i.description !== 'Propina')
            .reduce((s, i) => s + (i.total || 0), 0);
          inv.tipRate = abBase > 0 ? Math.round((inv.tipAmount / abBase) * 10000) / 100 : 0;
        }

        await inv.save();
        updated++;
        console.log(`  ${inv.number}: IVA=${inv.ivaAmount} ICO=${inv.icoAmount} Propina=${inv.tipAmount} (desde cotización)`);
        continue;
      }
    }

    // Sin cotización: el taxAmount histórico se asume 100% IVA
    if (inv.taxAmount > 0) {
      inv.ivaAmount = inv.taxAmount;
      await inv.save();
      updated++;
      console.log(`  ${inv.number}: IVA=${inv.ivaAmount} (desde taxAmount histórico)`);
    }
  }

  console.log(`\nFacturas actualizadas: ${updated}`);
  await mongoose.disconnect();
  console.log('Desconectado. Backfill finalizado.');
}

backfill().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
