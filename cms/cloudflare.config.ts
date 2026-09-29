import { bindings, defineConfig, triggers } from 'cf/config';

export default defineConfig({
  worker: {
    name: 'aryakdev-cms',
    domains: ['cms.aryak.dev'],
    compatibilityDate: '2026-09-29',
    compatibilityFlags: ['nodejs_compat'],
    entrypoint: './src/worker.ts',
    triggers: [triggers.scheduled({ schedule: '* * * * *' })],
    env: {
      DB: bindings.d1({ name: 'aryakdev-cms' }),
      MEDIA: bindings.r2({ name: 'aryakdev-cms-media' }),
    },
  },
});
