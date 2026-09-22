// SiteFooter — global footer chrome (Task 014).
//
// Verified behaviours:
//   - Renders the EzyHome business name.
//   - Renders the current copyright year.
//   - Exposes secondary nav links to /catalogo and /blog so visitors can
//     navigate from the footer without scrolling back to the header.
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SiteFooter from '@/components/layout/SiteFooter';

const renderFooter = () =>
  render(
    <MemoryRouter>
      <SiteFooter />
    </MemoryRouter>,
  );

describe('SiteFooter', () => {
  it('should render the EzyHome business name', () => {
    renderFooter();

    expect(screen.getByText(/ezyhome/i)).toBeInTheDocument();
  });

  it('should display the current copyright year', () => {
    renderFooter();

    const year = String(new Date().getFullYear());
    expect(screen.getByText((content) => content.includes(year))).toBeInTheDocument();
  });

  it('should expose secondary nav links to /catalogo and /blog', () => {
    renderFooter();

    const nav = screen.getByRole('navigation', { name: /pie de página/i });
    expect(within(nav).getByRole('link', { name: /catálogo/i })).toHaveAttribute(
      'href',
      '/catalogo',
    );
    expect(within(nav).getByRole('link', { name: /blog/i })).toHaveAttribute('href', '/blog');
  });
});
