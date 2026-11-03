import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  // Los tests no leen los `.env*` del proyecto: con un `.env.local` de
  // desarrollo (clave del ERP, Mercado Pago encendido) los tests dependían de
  // esa máquina, y los de precio podían pegarle al ERP local. `tests/` no
  // tiene archivos `.env`, así que corren igual que en el CI; cada test que
  // necesita una variable la fija con `vi.stubEnv`.
  envDir: path.resolve(__dirname, './tests'),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
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
