import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
// Fuente variable: un solo archivo cubre todos los pesos. Solo la normal (sin
// itálica) y con `font-display: swap`, para no frenar la primera pantalla.
import '@fontsource-variable/plus-jakarta-sans/wght.css';
import '@fontsource/geist-mono/400.css';
import '@/styles/global.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found in index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
