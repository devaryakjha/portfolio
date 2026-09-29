import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import { d1, r2 } from '@emdash-cms/cloudflare';
import { defineConfig } from 'astro/config';
import emdash from 'emdash/astro';

export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  integrations: [
    react(),
    emdash({
      siteUrl: 'https://cms.aryak.dev',
      database: d1({ binding: 'DB' }),
      storage: r2({ binding: 'MEDIA' }),
      plugins: [{
        id: 'portfolio-publish', version: '1.0.0', format: 'native',
        entrypoint: new URL('./src/plugins/publish.mjs', import.meta.url).pathname,
      }],
    }),
  ],
});
