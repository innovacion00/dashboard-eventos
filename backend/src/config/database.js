import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

export async function connectDatabase() {
  try {
    await mongoose.connect(env.MONGO_URI);
    logger.info({ uri: env.MONGO_URI }, 'Conectado a MongoDB');
  } catch (err) {
    logger.error({ err }, 'Error al conectar a MongoDB');
    // En serverless no usar process.exit — lanzar el error para que el caller decida
    throw err;
  }
}

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB desconectado');
});
