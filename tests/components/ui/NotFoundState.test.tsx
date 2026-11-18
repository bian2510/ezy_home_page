import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFoundState from '@/components/ui/NotFoundState';

describe('NotFoundState', () => {
  it('should explain the page does not exist and link back', () => {
    render(
      <MemoryRouter>
        <NotFoundState
          breadcrumb={[{ label: 'Página no encontrada' }]}
          message="La página que buscás no existe."
          back={{ to: '/', label: 'Volver al inicio' }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('404');
    expect(screen.getByText('La página que buscás no existe.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/');
  });
});
