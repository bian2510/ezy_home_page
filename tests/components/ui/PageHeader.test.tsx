import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';

const renderHeader = () =>
  render(
    <MemoryRouter>
      <PageHeader id="blog-heading" breadcrumb={[{ label: 'Blog' }]} title="Consejos">
        Guías prácticas.
      </PageHeader>
    </MemoryRouter>,
  );

describe('PageHeader', () => {
  it('should render the page title as the only level-1 heading', () => {
    renderHeader();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Consejos');
  });

  it('should name its section after the title', () => {
    renderHeader();

    expect(screen.getByRole('region', { name: 'Consejos' })).toBeInTheDocument();
  });

  it('should start with the breadcrumb back to Inicio', () => {
    renderHeader();
    const nav = screen.getByRole('navigation', { name: /ruta de navegación/i });

    expect(within(nav).getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/');
    expect(within(nav).getByText('Blog')).toHaveAttribute('aria-current', 'page');
  });

  it('should show the subtitle', () => {
    renderHeader();

    expect(screen.getByText('Guías prácticas.')).toBeInTheDocument();
  });
});
