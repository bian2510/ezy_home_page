// Página de contacto: WhatsApp (con el horario de atención), email (con
// copiar) e Instagram.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ContactoPage from '@/pages/ContactoPage';
import { ToastProvider } from '@/features/toast';
import { SITE_CONTACT } from '@/data/siteContact';

const renderPage = () =>
  render(
    <MemoryRouter>
      <ToastProvider>
        <ContactoPage />
      </ToastProvider>
    </MemoryRouter>,
  );

// `userEvent.setup()` instala su propio portapapeles: se reemplaza después.
const replaceClipboard = (clipboard: unknown) =>
  Object.defineProperty(window.navigator, 'clipboard', {
    value: clipboard,
    configurable: true,
  });

describe('ContactoPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_WHATSAPP_NUMBER', '5491124741036');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('should render the page H1', () => {
    renderPage();

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Estamos acá para ayudarte a transformar tu hogar',
      }),
    ).toBeInTheDocument();
  });

  it('should render a breadcrumb back to the home page', () => {
    renderPage();

    const breadcrumb = screen.getByRole('navigation', { name: /ruta de navegación/i });
    expect(breadcrumb).toHaveTextContent(/inicio/i);
    expect(screen.getByRole('link', { name: /inicio/i })).toHaveAttribute('href', '/');
    expect(screen.getByText('Contactanos')).toHaveAttribute('aria-current', 'page');
  });

  it('should show the store phone in the WhatsApp card', () => {
    renderPage();

    expect(screen.getByText(SITE_CONTACT.phone)).toBeInTheDocument();
  });

  it('should open the store WhatsApp in a new tab when the number is configured', () => {
    renderPage();

    const link = screen.getByRole('link', { name: /escribinos por whatsapp/i });
    expect(link).toHaveAttribute('href', 'https://wa.me/5491124741036');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should hide the WhatsApp button when the number is not configured', () => {
    vi.stubEnv('VITE_WHATSAPP_NUMBER', '');
    renderPage();

    expect(screen.queryByRole('link', { name: /escribinos por whatsapp/i })).toBeNull();
  });

  it('should show the business hours in the WhatsApp card', () => {
    renderPage();

    const card = screen.getByRole('heading', { name: 'WhatsApp' }).closest('li');
    expect(card).toHaveTextContent('Lunes a viernes de 10 a 18 h');
  });

  it('should link "Enviar un email" to a mailto with the store email', () => {
    renderPage();

    expect(screen.getByRole('link', { name: /enviar un email/i })).toHaveAttribute(
      'href',
      `mailto:${SITE_CONTACT.email}`,
    );
  });

  it('should copy the store email and confirm it when the copy button is pressed', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    replaceClipboard({ writeText });
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Copiar email' }));

    expect(writeText).toHaveBeenCalledWith(SITE_CONTACT.email);
    expect(await screen.findByText(/email copiado/i)).toBeInTheDocument();
  });

  it('should tell the visitor to copy it by hand when the clipboard is unavailable', async () => {
    const user = userEvent.setup();
    replaceClipboard(undefined);
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Copiar email' }));

    expect(await screen.findByText(/no pudimos copiar el email/i)).toBeInTheDocument();
  });

  it('should tell the visitor to copy it by hand when the clipboard rejects', async () => {
    const user = userEvent.setup();
    replaceClipboard({ writeText: vi.fn().mockRejectedValue(new Error('denied')) });
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Copiar email' }));

    expect(await screen.findByText(/no pudimos copiar el email/i)).toBeInTheDocument();
  });

  it('should show the Instagram handle', () => {
    renderPage();

    expect(screen.getByText('@ezyhome.ar')).toBeInTheDocument();
  });

  it('should open the Instagram profile in a new tab with safe link attributes', () => {
    renderPage();

    const link = screen.getByRole('link', { name: /seguinos en instagram/i });
    expect(link).toHaveAttribute('href', 'https://www.instagram.com/ezyhome.ar/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  // La franja de proyectos todavía no es una oferta: el dueño la decide antes
  // del deploy (2026-11-06). Se ve en local (`pnpm dev`) y no en producción.
  it('should not offer whole-home automation projects in production', () => {
    vi.stubEnv('DEV', false);
    renderPage();

    expect(screen.queryByText(/proyecto inmobiliario/i)).toBeNull();
  });

  it('should preview the projects band in local development', () => {
    vi.stubEnv('DEV', true);
    renderPage();

    expect(
      screen.getByRole('heading', { name: /proyecto inmobiliario/i, level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/constructoras, arquitectos/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^escribinos$/i })).toHaveAttribute(
      'href',
      'https://wa.me/5491124741036',
    );
  });
});
