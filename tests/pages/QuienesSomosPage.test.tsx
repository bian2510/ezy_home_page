import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
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

  it('should render the commitment section with three items', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /nuestro compromiso/i })).toBeInTheDocument();
    // Use exact strings to avoid matching words inside longer sentences.
    expect(screen.getByText('Profesionalismo')).toBeInTheDocument();
    expect(screen.getByText('Accesibilidad')).toBeInTheDocument();
    expect(screen.getByText('Confianza')).toBeInTheDocument();
  });

  it('should render the target audience section', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /a quién le vendemos/i })).toBeInTheDocument();
  });
});
