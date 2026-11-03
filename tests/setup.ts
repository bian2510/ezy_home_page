// Vitest setup. Loaded once before the test suite.
import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/react';

// Las rutas se cargan por demanda (React.lazy): con la suite entera corriendo,
// el primer import de un chunk puede tardar más que el segundo por defecto de
// findBy/waitFor y el test falla sin que haya un error real.
configure({ asyncUtilTimeout: 5000 });
