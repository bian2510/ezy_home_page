// Vitest setup. Loaded once before the test suite.
import '@testing-library/jest-dom/vitest';

// Ningún test sale a la red. El que necesita una respuesta la mockea con
// `vi.stubGlobal('fetch', ...)`; `vi.unstubAllGlobals()` vuelve a este fetch,
// no al real. Así un test que se olvida el mock falla en vez de llamar al ERP.
globalThis.fetch = (input) =>
  Promise.reject(
    new Error(
      `Request sin mockear en un test: ${String(input instanceof Request ? input.url : input)}`,
    ),
  );
