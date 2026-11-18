import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import QuienesSomosPage from '@/pages/QuienesSomosPage';

const renderPage = () =>
  render(
    <MemoryRouter>
      <QuienesSomosPage />
    </MemoryRouter>,
  );

describe('QuienesSomosPage', () => {
  it('should render the page heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /quiénes somos/i, level: 1 })).toBeInTheDocument();
  });

  it('should render the Misión section', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /nuestra misión/i })).toBeInTheDocument();
  });

  it('should render the problem section', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { name: /el problema que resolvemos/i }),
    ).toBeInTheDocument();
  });

  it('should render the target audience section', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /¿para quién es ezyhome\?/i })).toBeInTheDocument();
  });

  it('should render the three customer profiles', () => {
    renderPage();
    expect(screen.getByText(/querés mejorar tu hogar/i)).toBeInTheDocument();
    expect(screen.getByText(/la seguridad es prioridad/i)).toBeInTheDocument();
    expect(screen.getByText(/empezás con algo pequeño/i)).toBeInTheDocument();
  });

  it('should render the commitment section with three items', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /nuestro compromiso/i })).toBeInTheDocument();
    expect(screen.getByText('Profesionalismo')).toBeInTheDocument();
    expect(screen.getByText('Accesibilidad')).toBeInTheDocument();
    expect(screen.getByText('Confianza')).toBeInTheDocument();
  });
  it('should show the breadcrumb back to Inicio', () => {
    renderPage();
    const nav = screen.getByRole('navigation', { name: /ruta de navegación/i });
    expect(within(nav).getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/');
  });

  it('should close with links to the catalog and to contact', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /ver productos/i })).toHaveAttribute(
      'href',
      '/catalogo',
    );
    expect(screen.getByRole('link', { name: /contactanos/i })).toHaveAttribute('href', '/contacto');
  });
});
