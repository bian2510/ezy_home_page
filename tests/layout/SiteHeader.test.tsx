// SiteHeader — global navigation chrome (Task 014).
//
// Verified behaviours:
//   - Logo links to `/`.
//   - Primary nav exposes Catálogo, Blog, and Carrito links.
//   - Cart badge mirrors `useCart().itemCount`, and is hidden at zero so
//     visitors don't see a stale "0" indicator (DOMAIN.md › Design
//     Implications: cada señal en el header debe ser informativa).
//
// All renders wrap the header in `MemoryRouter` + `CartProvider` to satisfy
// `react-router-dom` and the `useCart` hook contract.
import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useEffect, type ReactNode } from 'react';
import SiteHeader from '@/components/layout/SiteHeader';
import { CartProvider } from '@/features/cart/CartProvider';
import { useCart } from '@/features/cart/useCart';
import type { Product } from '@/types';

const sampleProduct: Product = {
  id: 'sku-001',
  name: 'Smart Bulb RGBW',
  description: 'Foco LED Wi-Fi 9W',
  price: 15000,
  images: ['/images/sku-001.jpg'],
  category: 'iluminacion',
  isBestseller: false,
  isOnSale: false,
};

// Test helper that lets a single test imperatively populate the cart from
// inside the provider tree so the rendered SiteHeader observes the change.
// Runs in an effect to avoid React's "setState in render" warning.
function CartSeed({
  quantity,
  children,
}: {
  quantity: number;
  children: ReactNode;
}) {
  const { addItem } = useCart();
  useEffect(() => {
    if (quantity > 0) {
      addItem(sampleProduct, quantity);
    }
    // Seed runs exactly once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <>{children}</>;
}

const renderHeader = (initialQuantity = 0) =>
  render(
    <MemoryRouter>
      <CartProvider>
        <CartSeed quantity={initialQuantity}>
          <SiteHeader />
        </CartSeed>
      </CartProvider>
    </MemoryRouter>,
  );

describe('SiteHeader', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should render the EzyHome logo linking to /', () => {
    renderHeader();

    const logo = screen.getByRole('link', { name: /ezyhome/i });
    expect(logo).toHaveAttribute('href', '/');
  });

  it('should render primary nav links to /catalogo, /blog, and /carrito', () => {
    renderHeader();

    const nav = screen.getByRole('navigation', { name: /principal/i });
    expect(
      within(nav).getByRole('link', { name: /catálogo/i }),
    ).toHaveAttribute('href', '/catalogo');
    expect(within(nav).getByRole('link', { name: /blog/i })).toHaveAttribute(
      'href',
      '/blog',
    );
    expect(within(nav).getByRole('link', { name: /carrito/i })).toHaveAttribute(
      'href',
      '/carrito',
    );
  });

  it('should hide the cart badge when itemCount is zero', () => {
    renderHeader(0);

    expect(screen.queryByTestId('cart-badge')).toBeNull();
  });

  it('should show the cart badge with itemCount when the cart has items', () => {
    renderHeader(3);

    const badge = screen.getByTestId('cart-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('3');
  });
});

