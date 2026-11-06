import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Los tests no leen los `.env*` de la raíz (por ejemplo el `.env.local` de
  // quien los corre): el resultado no depende de la máquina y ningún test
  // llama al ERP real. Cada test que necesita otro valor usa `vi.stubEnv`.
  envDir: path.resolve(__dirname, './tests'),
  test: {
    // Pisan también lo que venga exportado en la shell.
    env: {
      VITE_STORE_API_KEY: '',
      VITE_STORE_API_URL: '',
      VITE_MERCADOPAGO_ENABLED: 'false',
      VITE_WHATSAPP_NUMBER: '',
    },
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: ['node_modules/', 'dist/', 'tests/', '**/*.config.*', '**/*.d.ts', 'src/main.tsx'],
    },
  },
});
