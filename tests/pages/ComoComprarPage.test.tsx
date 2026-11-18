import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
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
    expect(
      screen.getByRole('heading', { name: /cómo comprar en ezyhome/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it('should render the 3 purchase steps in order', () => {
    renderPage();
    const list = screen.getByRole('list', { name: /pasos para comprar/i });
    const steps = within(list).getAllByRole('heading', { level: 2 });

    expect(list.tagName).toBe('OL');
    expect(steps.map((step) => step.textContent)).toEqual([
      'Seleccioná tus productos inteligentes',
      'Completá tus datos de entrega y facturación',
      'Aboná con transferencia o Mercado Pago',
    ]);
  });

  it('should link to the catalog from the first step', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /ver el catálogo/i })).toHaveAttribute(
      'href',
      '/catalogo',
    );
  });

  it('should promise the delivery the checkout offers: free pick-up or shipping quoted before paying', () => {
    renderPage();
    const step = screen.getByText(/retiro sin cargo en nuestro punto pick-up/i);
    expect(step).toHaveTextContent(/envío a domicilio/i);
    expect(step).toHaveTextContent(/código postal/i);
    expect(step).toHaveTextContent(/antes de pagar/i);
    expect(screen.queryByText(/coordiná el envío/i)).not.toBeInTheDocument();
  });

  it('should show the breadcrumb back to Inicio', () => {
    renderPage();
    const nav = screen.getByRole('navigation', { name: /ruta de navegación/i });
    expect(within(nav).getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/');
  });
});
