import mongoose from 'mongoose';
import { app } from '../src/app.js';
import { env } from '../src/config/env.js';

// Reutiliza la conexión entre invocaciones en el mismo contenedor serverless.
// Mongoose guarda el estado en `mongoose.connection.readyState`:
//   0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
if (mongoose.connection.readyState === 0) {
  mongoose.connect(env.MONGO_URI).catch((err) => {
    console.error('MongoDB connection error:', err);
  });
}

export default app;
