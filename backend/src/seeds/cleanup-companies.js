import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { Company } from '../modules/companies/company.model.js';
import { Opportunity } from '../modules/opportunities/opportunity.model.js';
import { Quote } from '../modules/quotes/quote.model.js';
import { Activity } from '../modules/activities/activity.model.js';
import { Event } from '../modules/events/event.model.js';
import { Beo } from '../modules/beos/beo.model.js';
import { EventCost } from '../modules/event-costs/event-cost.model.js';
import { Invoice } from '../modules/invoices/invoice.model.js';
import { Contact } from '../modules/contacts/contact.model.js';

const COMPANY_NAMES = ['camilo prueba'];

async function cleanup() {
  await mongoose.connect(env.MONGO_URI);
  console.log('Conectado a MongoDB...\n');

  const companies = await Company.find({
    name: { $regex: new RegExp(`^(${COMPANY_NAMES.join('|')})$`, 'i') },
  });

  if (companies.length === 0) {
    console.log('No se encontraron empresas con esos nombres.');
    await mongoose.disconnect();
    return;
  }

  const companyIds = companies.map(c => c._id);
  console.log(`Empresas encontradas (${companies.length}):`);
  companies.forEach(c => console.log(`  - ${c.name} (${c._id})`));

  const opportunities = await Opportunity.find({ companyId: { $in: companyIds } });
  const oppIds = opportunities.map(o => o._id);

  const quotes = await Quote.find({ $or: [{ companyId: { $in: companyIds } }, { opportunityId: { $in: oppIds } }] });
  const quoteIds = quotes.map(q => q._id);

  const events = await Event.find({ $or: [{ companyId: { $in: companyIds } }, { opportunityId: { $in: oppIds } }, { quoteId: { $in: quoteIds } }] });
  const eventIds = events.map(e => e._id);

  const beos = await Beo.find({ eventId: { $in: eventIds } });
  const eventCosts = await EventCost.find({ eventId: { $in: eventIds } });
  const invoices = await Invoice.find({ $or: [{ eventId: { $in: eventIds } }, { companyId: { $in: companyIds } }] });
  const activities = await Activity.find({ companyId: { $in: companyIds } });
  const contacts = await Contact.find({ companyId: { $in: companyIds } });

  console.log(`\nRegistros a eliminar:`);
  console.log(`  Empresas:       ${companies.length}`);
  console.log(`  Contactos:      ${contacts.length}`);
  console.log(`  Oportunidades:  ${opportunities.length}`);
  console.log(`  Cotizaciones:   ${quotes.length}`);
  console.log(`  Eventos:        ${events.length}`);
  console.log(`  BEOs:           ${beos.length}`);
  console.log(`  Costos evento:  ${eventCosts.length}`);
  console.log(`  Facturas:       ${invoices.length}`);
  console.log(`  Actividades:    ${activities.length}`);
  console.log(`\nEliminando...\n`);

  const results = await Promise.all([
    Beo.deleteMany({ eventId: { $in: eventIds } }),
    EventCost.deleteMany({ eventId: { $in: eventIds } }),
    Invoice.deleteMany({ _id: { $in: invoices.map(i => i._id) } }),
    Event.deleteMany({ _id: { $in: eventIds } }),
    Quote.deleteMany({ _id: { $in: quoteIds } }),
    Activity.deleteMany({ companyId: { $in: companyIds } }),
    Opportunity.deleteMany({ _id: { $in: oppIds } }),
    Contact.deleteMany({ companyId: { $in: companyIds } }),
    Company.deleteMany({ _id: { $in: companyIds } }),
  ]);

  console.log('Eliminación completada:');
  console.log(`  BEOs:           ${results[0].deletedCount}`);
  console.log(`  Costos evento:  ${results[1].deletedCount}`);
  console.log(`  Facturas:       ${results[2].deletedCount}`);
  console.log(`  Eventos:        ${results[3].deletedCount}`);
  console.log(`  Cotizaciones:   ${results[4].deletedCount}`);
  console.log(`  Actividades:    ${results[5].deletedCount}`);
  console.log(`  Oportunidades:  ${results[6].deletedCount}`);
  console.log(`  Contactos:      ${results[7].deletedCount}`);
  console.log(`  Empresas:       ${results[8].deletedCount}`);

  await mongoose.disconnect();
  console.log('\nDesconectado. Limpieza finalizada.');
}

cleanup().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
