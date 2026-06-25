import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';

export default defineConfig({
  integrations: [react()],
  server: { port: 4321, host: true },
  output: 'server',
  adapter: node({ mode: 'standalone' }),
});
