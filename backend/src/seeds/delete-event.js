import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { Event } from '../modules/events/event.model.js';
import { Beo } from '../modules/beos/beo.model.js';
import { Commission } from '../modules/commissions/commission.model.js';
import { Invoice } from '../modules/invoices/invoice.model.js';

// Importación dinámica de modelos opcionales para no romper si no existen
async function loadOptional(path, name) {
  try {
    const mod = await import(path);
    return mod[name] || null;
  } catch {
    return null;
  }
}

const EVENT_NUMBER = 'EVT-2026-0003';

async function deleteEvent() {
  await mongoose.connect(env.MONGO_URI);
  console.log('Conectado a MongoDB...\n');

  const event = await Event.findOne({ number: EVENT_NUMBER });
  if (!event) {
    console.log(`Evento ${EVENT_NUMBER} no encontrado.`);
    await mongoose.disconnect();
    return;
  }

  const id = event._id;
  console.log(`Evento encontrado: ${event.number} — ${event.name} (${id})\n`);

  // Modelos opcionales
  const EventCost   = await loadOptional('../modules/event-costs/event-cost.model.js', 'EventCost');
  const Survey      = await loadOptional('../modules/surveys/survey.model.js', 'Survey');
  const SurveyResp  = await loadOptional('../modules/surveys/survey-response.model.js', 'SurveyResponse');

  // Preview de lo que se va a eliminar
  const counts = {
    beos:          await Beo.countDocuments({ eventId: id }),
    commissions:   await Commission.countDocuments({ eventId: id }),
    invoices:      await Invoice.countDocuments({ eventId: id }),
    eventCosts:    EventCost  ? await EventCost.countDocuments({ eventId: id })  : 0,
    surveys:       Survey     ? await Survey.countDocuments({ eventId: id })      : 0,
    surveyResps:   SurveyResp ? await SurveyResp.countDocuments({ eventId: id }) : 0,
  };

  console.log('Registros a eliminar:');
  console.log(`  BEOs            : ${counts.beos}`);
  console.log(`  Comisiones      : ${counts.commissions}`);
  console.log(`  Facturas        : ${counts.invoices}`);
  console.log(`  Costos/Utilidad : ${counts.eventCosts}`);
  console.log(`  Encuestas       : ${counts.surveys}`);
  console.log(`  Resp. encuestas : ${counts.surveyResps}`);
  console.log(`  Evento          : 1\n`);

  // Eliminación hard delete
  await Beo.deleteMany({ eventId: id });
  console.log(`  ✓ BEOs eliminados`);

  await Commission.deleteMany({ eventId: id });
  console.log(`  ✓ Comisiones eliminadas`);

  await Invoice.deleteMany({ eventId: id });
  console.log(`  ✓ Facturas eliminadas`);

  if (EventCost) {
    await EventCost.deleteMany({ eventId: id });
    console.log(`  ✓ Costos/Utilidades eliminados`);
  }

  if (Survey) {
    await Survey.deleteMany({ eventId: id });
    console.log(`  ✓ Encuestas eliminadas`);
  }

  if (SurveyResp) {
    await SurveyResp.deleteMany({ eventId: id });
    console.log(`  ✓ Respuestas de encuesta eliminadas`);
  }

  await Event.deleteOne({ _id: id });
  console.log(`  ✓ Evento ${EVENT_NUMBER} eliminado`);

  await mongoose.disconnect();
  console.log('\nDesconectado. Eliminación finalizada.');
}

deleteEvent().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
