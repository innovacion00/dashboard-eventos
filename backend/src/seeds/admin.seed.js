import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { User } from '../modules/users/user.model.js';
import { ROLES } from '../core/constants/roles.js';

async function seed() {
  if (!env.ADMIN_PASSWORD) {
    console.error('ADMIN_PASSWORD no está definida en .env. Abortando.');
    process.exit(1);
  }

  await mongoose.connect(env.MONGO_URI);
  console.log('Conectado a MongoDB para sembrar usuario administrador...');

  const exists = await User.findOne({ email: env.ADMIN_EMAIL });
  if (exists) {
    console.log(`El usuario administrador ${env.ADMIN_EMAIL} ya existe. Nada que hacer.`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await User.hashPassword(env.ADMIN_PASSWORD);

  await User.create({
    name: env.ADMIN_NAME,
    email: env.ADMIN_EMAIL,
    passwordHash,
    role: ROLES.ADMINISTRADOR,
    status: 'ACTIVO',
  });

  console.log(`Administrador creado: ${env.ADMIN_NAME} <${env.ADMIN_EMAIL}>`);
  await mongoose.disconnect();
  console.log('Desconectado de MongoDB.');
}

seed().catch((err) => {
  console.error('Error en seed de administrador:', err);
  process.exit(1);
});
