import 'dotenv/config';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Variable de entorno requerida no definida: ${name}`);
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000', 10),

  MONGO_URI: requireEnv('MONGO_URI'),

  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),

  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:4321',

  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  ADMIN_NAME: process.env.ADMIN_NAME || 'Administrador GEH',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@gehsuites.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
};
