// Vitest setup. Loaded once before the test suite.
import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/react';

// Las rutas se cargan por demanda (React.lazy): con la suite entera corriendo,
// el primer import de un chunk puede tardar más que el segundo por defecto de
// findBy/waitFor y el test falla sin que haya un error real.
configure({ asyncUtilTimeout: 5000 });

// Ningún test sale a la red. El que necesita una respuesta la mockea con
// `vi.stubGlobal('fetch', ...)`; `vi.unstubAllGlobals()` vuelve a este fetch,
// no al real. Así un test que se olvida el mock falla en vez de llamar al ERP.
globalThis.fetch = (input) =>
  Promise.reject(
    new Error(
      `Request sin mockear en un test: ${String(input instanceof Request ? input.url : input)}`,
    ),
  );
