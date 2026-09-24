import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { seoPlugin } from './scripts/vite-plugin-seo.ts';
import { SITIO_POR_DEFECTO } from './scripts/lib/sitemap.ts';

// Vite config for the EzyHome storefront. Static SPA build published to
// Cloudflare Pages by CI (see docs/guides/deploy-y-ci.md).
export default defineConfig(({ mode }) => {
  // `VITE_SITE_URL` alimenta el sitemap y el robots.txt; la app lee la misma
  // variable para las canónicas, vía `src/lib/env.ts`.
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    plugins: [react(), seoPlugin(env.VITE_SITE_URL ?? SITIO_POR_DEFECTO)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      host: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      target: 'es2022',
    },
  };
});
