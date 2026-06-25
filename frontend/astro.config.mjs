import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  integrations: [react()],
  server: { port: 4321, host: true },
  output: 'server',
  adapter: vercel(),
});
