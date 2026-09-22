import { describe, expect, it, vi } from 'vitest';
import { act, render, renderHook, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type { Product } from '@/types';
import CatalogPage from '@/features/catalog/CatalogPage';
import { useCatalog } from '@/features/catalog/useCatalog';
import { buildProduct as buildBaseProduct } from '../../helpers/builders';

vi.mock('@/features/catalog/ProductCard', () => ({
  default: ({ product }: { product: Product }) => (
    <div data-testid="product-card">{product.name}</div>
  ),
}));

// Las categorías del mock replican la taxonomía real de `products.json`:
// son los nombres que se muestran tal cual, sin tabla de labels intermedia.
vi.mock('@/data/products.json', () => ({
  default: [
    {
      id: '1',
      name: 'Bulbo RGBW',
      category: 'Iluminación Inteligente',
      price: 15000,
      images: ['/img.jpg'],
      isBestseller: false,
      isOnSale: false,
      description: 'Test',
      active: true,
    },
    {
      id: '2',
      name: 'Sensor Gas',
      category: 'Seguridad',
      price: 8000,
      images: ['/img.jpg'],
      isBestseller: false,
      isOnSale: false,
      description: 'Test',
      active: true,
    },
    {
      id: '3',
      name: 'Enchufe WiFi',
      category: 'Confort',
      price: 12000,
      images: ['/img.jpg'],
      isBestseller: false,
      isOnSale: false,
      description: 'Test',
      active: true,
    },
    {
      id: '4',
      name: 'Cerradura Inactiva',
      category: 'Seguridad',
      price: 20000,
      images: ['/img.jpg'],
      isBestseller: false,
      isOnSale: false,
      description: 'Test',
      active: false,
    },
    {
      id: '5',
      name: 'Lámpara Sin Categoría',
      category: null,
      price: 9000,
      images: ['/img.jpg'],
      isBestseller: false,
      isOnSale: false,
      description: 'Test',
      active: true,
    },
  ],
}));

const buildProduct = (overrides: Partial<Product> = {}): Product =>
  buildBaseProduct({
    name: 'Producto',
    description: 'Descripción',
    price: 10000,
    images: ['/img.jpg'],
    ...overrides,
  });

const renderCatalog = (path = '/catalogo') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <CatalogPage />
    </MemoryRouter>,
  );

const filterGroup = () => screen.getByRole('group', { name: /filtrar por categoría/i });

describe('CatalogPage', () => {
  it('should render all active product cards by default when no category is selected', () => {
    renderCatalog();

    const cards = screen.getAllByTestId('product-card');
    expect(cards).toHaveLength(4);
    expect(screen.getByText('Bulbo RGBW')).toBeInTheDocument();
    expect(screen.getByText('Sensor Gas')).toBeInTheDocument();
    expect(screen.getByText('Enchufe WiFi')).toBeInTheDocument();
  });

  it('should not render inactive products in the catalog grid', () => {
    renderCatalog();

    expect(screen.queryByText('Cerradura Inactiva')).not.toBeInTheDocument();
  });

  it('should render the page heading "Catálogo"', () => {
    renderCatalog();

    expect(screen.getByRole('heading', { name: /catálogo/i, level: 1 })).toBeInTheDocument();
  });

  it('should label each chip with the category name exactly as it appears in the data', () => {
    renderCatalog();

    expect(
      within(filterGroup()).getByRole('button', { name: 'Iluminación Inteligente' }),
    ).toBeInTheDocument();
    expect(within(filterGroup()).getByRole('button', { name: 'Confort' })).toBeInTheDocument();
  });

  it('should never render a chip without a visible label', () => {
    renderCatalog();

    const chips = within(filterGroup()).getAllByRole('button');
    chips.forEach((chip) => {
      expect(chip.textContent?.trim()).not.toBe('');
    });
  });

  it('should not render a chip for products that have no category', () => {
    renderCatalog();

    const chipLabels = within(filterGroup())
      .getAllByRole('button')
      .map((chip) => chip.textContent?.trim());

    expect(chipLabels).toEqual(['Todos', 'Iluminación Inteligente', 'Seguridad', 'Confort']);
  });

  it('should filter to a single category when its chip is clicked', async () => {
    const user = userEvent.setup();
    renderCatalog();

    await user.click(screen.getByRole('button', { name: 'Iluminación Inteligente' }));

    const cards = screen.getAllByTestId('product-card');
    expect(cards).toHaveLength(1);
    expect(screen.getByText('Bulbo RGBW')).toBeInTheDocument();
    expect(screen.queryByText('Sensor Gas')).not.toBeInTheDocument();
    expect(screen.queryByText('Enchufe WiFi')).not.toBeInTheDocument();
  });

  it('should show all products again when the Todos chip is clicked after filtering', async () => {
    const user = userEvent.setup();
    renderCatalog();

    await user.click(screen.getByRole('button', { name: 'Iluminación Inteligente' }));
    expect(screen.getAllByTestId('product-card')).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Todos' }));

    expect(screen.getAllByTestId('product-card')).toHaveLength(4);
  });

  it('should preselect the category coming from the ?category= query param', () => {
    renderCatalog('/catalogo?category=Seguridad');

    expect(screen.getAllByTestId('product-card')).toHaveLength(1);
    expect(screen.getByText('Sensor Gas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Seguridad' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('should fall back to all products when the ?category= query param matches nothing', () => {
    renderCatalog('/catalogo?category=Inexistente');

    expect(screen.getAllByTestId('product-card')).toHaveLength(4);
    expect(screen.getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('should display an empty-state message when no products match the selected category', async () => {
    const user = userEvent.setup();
    renderCatalog();

    await user.click(screen.getByRole('button', { name: 'Iluminación Inteligente' }));

    expect(screen.queryByText(/no hay productos en esta categoría/i)).not.toBeInTheDocument();
  });
});

describe('useCatalog', () => {
  it('should return all products when selectedCategory is null', () => {
    const products = [
      buildProduct({ id: '1', category: 'Iluminación Inteligente' }),
      buildProduct({ id: '2', category: 'Seguridad' }),
      buildProduct({ id: '3', category: 'Confort' }),
    ];

    const { result } = renderHook(() => useCatalog(products));

    expect(result.current.selectedCategory).toBeNull();
    expect(result.current.filtered).toHaveLength(3);
  });

  it('should return only products in the selected category when setCategory is called', () => {
    const products = [
      buildProduct({ id: '1', category: 'Iluminación Inteligente' }),
      buildProduct({ id: '2', category: 'Seguridad' }),
      buildProduct({ id: '3', category: 'Iluminación Inteligente' }),
    ];

    const { result } = renderHook(() => useCatalog(products));

    act(() => {
      result.current.setCategory('Iluminación Inteligente');
    });

    expect(result.current.selectedCategory).toBe('Iluminación Inteligente');
    expect(result.current.filtered).toHaveLength(2);
    expect(result.current.filtered.every((p) => p.category === 'Iluminación Inteligente')).toBe(
      true,
    );
  });

  it('should return all products again when setCategory is called with null after filtering', () => {
    const products = [
      buildProduct({ id: '1', category: 'Iluminación Inteligente' }),
      buildProduct({ id: '2', category: 'Seguridad' }),
    ];

    const { result } = renderHook(() => useCatalog(products));

    act(() => {
      result.current.setCategory('Iluminación Inteligente');
    });
    expect(result.current.filtered).toHaveLength(1);

    act(() => {
      result.current.setCategory(null);
    });

    expect(result.current.filtered).toHaveLength(2);
  });

  it('should return a deduplicated list of unique categories from the products', () => {
    const products = [
      buildProduct({ id: '1', category: 'Iluminación Inteligente' }),
      buildProduct({ id: '2', category: 'Seguridad' }),
      buildProduct({ id: '3', category: 'Iluminación Inteligente' }),
      buildProduct({ id: '4', category: 'Confort' }),
      buildProduct({ id: '5', category: 'Seguridad' }),
    ];

    const { result } = renderHook(() => useCatalog(products));

    expect(result.current.categories).toHaveLength(3);
    expect(result.current.categories).toEqual(
      expect.arrayContaining(['Iluminación Inteligente', 'Seguridad', 'Confort']),
    );
  });

  it('should exclude products without a category from the derived category list', () => {
    const products = [
      buildProduct({ id: '1', category: 'Iluminación Inteligente' }),
      buildProduct({ id: '2', category: null }),
    ];

    const { result } = renderHook(() => useCatalog(products));

    expect(result.current.categories).toEqual(['Iluminación Inteligente']);
  });

  it('should still list a product without a category in the unfiltered grid', () => {
    const products = [
      buildProduct({ id: '1', category: 'Iluminación Inteligente' }),
      buildProduct({ id: '2', category: null }),
    ];

    const { result } = renderHook(() => useCatalog(products));

    expect(result.current.filtered).toHaveLength(2);
  });

  it('should exclude inactive products from filtered', () => {
    const products = [
      buildProduct({ id: '1', category: 'Iluminación Inteligente', active: true }),
      buildProduct({ id: '2', category: 'Iluminación Inteligente', active: false }),
    ];

    const { result } = renderHook(() => useCatalog(products));

    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered.every((p) => p.active)).toBe(true);
  });

  it('should not derive a category from an inactive product', () => {
    const products = [
      buildProduct({ id: '1', category: 'Iluminación Inteligente', active: true }),
      buildProduct({ id: '2', category: 'Seguridad', active: false }),
    ];

    const { result } = renderHook(() => useCatalog(products));

    expect(result.current.categories).toEqual(['Iluminación Inteligente']);
  });

  it('should return an empty filtered list when the selected category matches no products', () => {
    const products = [buildProduct({ id: '1', category: 'Iluminación Inteligente' })];

    const { result } = renderHook(() => useCatalog(products));

    act(() => {
      result.current.setCategory('Seguridad');
    });

    expect(result.current.filtered).toEqual([]);
  });
});
