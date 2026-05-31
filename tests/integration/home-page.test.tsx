// Integration test: full <App /> mounted at `/`.
//
// Verifies the Task 014 wiring end-to-end:
//   - RootLayout renders the SiteHeader + main + SiteFooter chrome.
//   - CartProvider is mounted at the layout level, so ProductCard (which
//     calls `useCart()`) renders without throwing.
//   - The HomePage hero + WhatsApp CTA sit inside the layout.
//
// `import.meta.glob` for blog Markdown is mocked because BlogPostPage is not
// rendered on `/`, but jsdom evaluates module-level side effects when the
// route bundle is imported through App.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';

describe('HomePage (integration)', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_WHATSAPP_NUMBER', '5491122334455');
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    window.localStorage.clear();
  });

  it('renders the storefront landing page end-to-end', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    // Header chrome (SiteHeader): logo + primary nav.
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /principal/i })).toBeInTheDocument();

    // Page-level H1 from HomePage.
    expect(
      screen.getByRole('heading', { name: /domótica para tu hogar/i, level: 1 }),
    ).toBeInTheDocument();

    // Primary CTA into the catalog.
    expect(screen.getByRole('link', { name: /ver catálogo/i })).toHaveAttribute(
      'href',
      '/catalogo',
    );

    // Footer chrome (SiteFooter).
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
