import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { logger } from './config/logger.js';
import { app } from './app.js';

async function start() {
  await connectDatabase();

  app.listen(env.PORT, () => {
    logger.info(`GEH Events API escuchando en http://localhost:${env.PORT}`);
    logger.info(`Entorno: ${env.NODE_ENV}`);
  });
}

start().catch((err) => {
  logger.error({ err }, 'Error fatal al iniciar el servidor');
  process.exit(1);
});
