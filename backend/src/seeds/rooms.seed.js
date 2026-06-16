import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { Room } from '../modules/rooms/room.model.js';

const ROOMS = [
  {
    name: 'Bond / Bold',
    aliases: ['Bond', 'Bold'],
    capacities: { auditorium: 250, school: 180, uShape: 120 },
  },
  {
    name: 'Cambridge',
    aliases: ['Cambridge'],
    capacities: { auditorium: 100, school: 60, uShape: 50 },
  },
  {
    name: 'London',
    aliases: ['London'],
    capacities: { auditorium: 90, school: 50, uShape: 40 },
  },
  {
    name: 'Oxford',
    aliases: ['Oxford', 'Oxxford'],
    capacities: { auditorium: 70, school: 50, uShape: 35 },
  },
  {
    name: 'Gales',
    aliases: ['Gales'],
    capacities: { auditorium: 40, school: 23, uShape: 25 },
  },
  {
    name: 'Kingston',
    aliases: ['Kingston'],
    capacities: { auditorium: 30, school: 18, uShape: 15 },
  },
  {
    name: 'Manchester',
    aliases: ['Manchester'],
    capacities: { auditorium: 35, school: 20, uShape: 18 },
  },
  {
    name: 'Newcastle',
    aliases: ['Newcastle', 'New Castel'],
    capacities: { auditorium: 50, school: 30, uShape: 20 },
  },
  {
    name: 'Sala de Juntas',
    aliases: ['Windsor', 'Embasy', 'Belfort'],
    capacities: { auditorium: 10, school: 10, uShape: 10 },
  },
];

async function seed() {
  await mongoose.connect(env.MONGO_URI);
  console.log('Conectado a MongoDB para sembrar salones...');

  let created = 0;
  let skipped = 0;

  for (const room of ROOMS) {
    const exists = await Room.findOne({ name: room.name });
    if (exists) {
      skipped++;
      continue;
    }
    await Room.create(room);
    created++;
  }

  console.log(`Salones sembrados: ${created} creados, ${skipped} ya existían.`);
  await mongoose.disconnect();
  console.log('Desconectado de MongoDB.');
}

seed().catch((err) => {
  console.error('Error en seed de salones:', err);
  process.exit(1);
});
