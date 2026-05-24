import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ComoComprarPage from '@/pages/ComoComprarPage';

const renderPage = () =>
  render(
    <MemoryRouter>
      <ComoComprarPage />
    </MemoryRouter>,
  );

describe('ComoComprarPage', () => {
  it('should render the page heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /cómo comprar/i, level: 1 })).toBeInTheDocument();
  });

  it('should render all 6 purchase steps', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /navegá el catálogo/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /agregá productos al carrito/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /enviá tu pedido/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /recibís la confirmación/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /realizás el pago/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /recibís en tu domicilio/i })).toBeInTheDocument();
  });

  it('should render an ordered list of steps', () => {
    renderPage();
    const list = screen.getByRole('list', { name: /pasos para comprar/i });
    expect(list).toBeInTheDocument();
    expect(list.tagName).toBe('OL');
  });

  it('should render CTAs linking to /catalogo and /carrito', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /ir al catálogo/i })).toHaveAttribute('href', '/catalogo');
    expect(screen.getByRole('link', { name: /ver carrito/i })).toHaveAttribute('href', '/carrito');
  });
});
