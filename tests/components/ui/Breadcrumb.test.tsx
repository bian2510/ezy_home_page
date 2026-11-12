import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Breadcrumb from '@/components/ui/Breadcrumb';

const renderBreadcrumb = () =>
  render(
    <MemoryRouter>
      <Breadcrumb items={[{ label: 'Blog', to: '/blog' }, { label: 'Un artículo' }]} />
    </MemoryRouter>,
  );

describe('Breadcrumb', () => {
  it('should start at Inicio and link every step but the last', () => {
    renderBreadcrumb();
    const nav = screen.getByRole('navigation', { name: /ruta de navegación/i });

    expect(within(nav).getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/');
    expect(within(nav).getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog');
    expect(within(nav).queryByRole('link', { name: 'Un artículo' })).not.toBeInTheDocument();
  });

  it('should mark the last step as the current page', () => {
    renderBreadcrumb();

    expect(screen.getByText('Un artículo')).toHaveAttribute('aria-current', 'page');
  });
});
