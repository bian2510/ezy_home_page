import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import ProductGrid from '@/features/catalog/ProductGrid';
import type { Product } from '@/types';
import { buildProduct } from '../../helpers/builders';

vi.mock('@/features/catalog/ProductCard', () => ({
  default: ({ product }: { product: Product }) => (
    <div data-testid={`product-card-${product.id}`}>{product.name}</div>
  ),
}));

describe('ProductGrid', () => {
  it('should render the section heading', () => {
    render(
      <ProductGrid
        id="mas-vendidos"
        heading="Más vendidos"
        products={[buildProduct()]}
        emptyMessage="Nada por acá."
      />,
    );

    expect(screen.getByRole('heading', { name: 'Más vendidos' })).toBeInTheDocument();
  });

  it('should render one card per product', () => {
    render(
      <ProductGrid
        id="mas-vendidos"
        heading="Más vendidos"
        products={[buildProduct({ id: 'a' }), buildProduct({ id: 'b', name: 'Sensor' })]}
        emptyMessage="Nada por acá."
      />,
    );

    expect(screen.getByTestId('product-card-a')).toBeInTheDocument();
    expect(screen.getByTestId('product-card-b')).toBeInTheDocument();
  });

  it('should render the empty message instead of the grid when there are no products', () => {
    render(
      <ProductGrid
        id="ofertas"
        heading="Ofertas"
        products={[]}
        emptyMessage="Por ahora no hay ofertas activas."
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Por ahora no hay ofertas activas.');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('should associate the section with its heading for assistive tech', () => {
    render(
      <ProductGrid
        id="ofertas"
        heading="Ofertas"
        products={[buildProduct()]}
        emptyMessage="Nada por acá."
      />,
    );

    const section = screen.getByRole('region', { name: 'Ofertas' });
    expect(within(section).getByTestId('product-card-p-1')).toBeInTheDocument();
  });
});
