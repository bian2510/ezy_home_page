import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
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

function CartSeed({ quantity, children }: { quantity: number; children: ReactNode }) {
  const { addItem } = useCart();
  useEffect(() => {
    if (quantity > 0) {
      addItem(sampleProduct, quantity);
    }
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

  it('should render primary nav links in desktop nav', () => {
    renderHeader();

    const nav = screen.getByRole('navigation', { name: /principal/i });
    expect(within(nav).getByRole('link', { name: /catálogo/i })).toHaveAttribute(
      'href',
      '/catalogo',
    );
    expect(within(nav).getByRole('link', { name: /blog/i })).toHaveAttribute('href', '/blog');
    expect(within(nav).getByRole('link', { name: /quiénes somos/i })).toHaveAttribute(
      'href',
      '/quienes-somos',
    );
    expect(within(nav).getByRole('link', { name: /cómo comprar/i })).toHaveAttribute(
      'href',
      '/como-comprar',
    );
    expect(within(nav).getByRole('link', { name: /carrito/i })).toHaveAttribute('href', '/carrito');
  });

  it('should hide the cart badge when itemCount is zero', () => {
    renderHeader(0);

    expect(screen.queryByTestId('cart-badge')).toBeNull();
  });

  it('should show the cart badge with itemCount when the cart has items', () => {
    renderHeader(3);

    // Two CartLink instances render (desktop + mobile toggle area); both show the badge.
    const badges = screen.getAllByTestId('cart-badge');
    expect(badges.length).toBeGreaterThan(0);
    badges.forEach((badge) => expect(badge).toHaveTextContent('3'));
  });

  it('should open mobile menu when hamburger button is clicked', () => {
    renderHeader();

    expect(screen.queryByRole('navigation', { name: /menú móvil/i })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /abrir menú/i }));

    expect(screen.getByRole('navigation', { name: /menú móvil/i })).toBeInTheDocument();
  });

  it('should close mobile menu when hamburger button is clicked again', () => {
    renderHeader();

    const btn = screen.getByRole('button', { name: /abrir menú/i });
    fireEvent.click(btn);
    expect(screen.getByRole('navigation', { name: /menú móvil/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cerrar menú/i }));
    expect(screen.queryByRole('navigation', { name: /menú móvil/i })).toBeNull();
  });
});
