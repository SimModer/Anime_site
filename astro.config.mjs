import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  adapter: vercel({
    includeFiles: [
      './node_modules/sql.js/dist/sql-wasm.wasm',
      './db/media.db'
    ],
  }),
});
