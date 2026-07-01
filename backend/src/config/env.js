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

  SPACES_KEY: process.env.SPACES_KEY || '',
  SPACES_SECRET: process.env.SPACES_SECRET || '',
  SPACES_ENDPOINT: process.env.SPACES_ENDPOINT || 'https://nyc3.digitaloceanspaces.com',
  SPACES_REGION: process.env.SPACES_REGION || 'nyc3',
  SPACES_BUCKET: process.env.SPACES_BUCKET || '',
  SPACES_CDN_URL: process.env.SPACES_CDN_URL || '',

  AUTOCORE_ACCESS_KEY: process.env.AUTOCORE_ACCESS_KEY || '',
  AUTOCORE_SECRET_KEY: process.env.AUTOCORE_SECRET_KEY || '',
  AUTOCORE_BEARER_TOKEN: process.env.AUTOCORE_BEARER_TOKEN || '',
  AUTOCORE_HOTEL_ID: process.env.AUTOCORE_HOTEL_ID || '18004',
  AUTOCORE_API_URL: process.env.AUTOCORE_API_URL || 'https://api.autocore.pro/v2',

  GMAIL_USER: process.env.GMAIL_USER || '',
  GMAIL_CLIENT_ID: process.env.GMAIL_CLIENT_ID || '',
  GMAIL_CLIENT_SECRET: process.env.GMAIL_CLIENT_SECRET || '',
  GMAIL_REFRESH_TOKEN: process.env.GMAIL_REFRESH_TOKEN || '',
};
