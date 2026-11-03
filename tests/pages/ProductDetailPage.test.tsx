import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import ProductDetailPage from '@/pages/ProductDetailPage';
import { CartProvider } from '@/features/cart/CartProvider';
import { formatPrice } from '@/lib/formatPrice';
import type { ProductPricing } from '@/types';

vi.mock('@/data/products.json', () => ({
  default: [
    {
      id: 'p-1',
      name: 'Foco Inteligente RGBW',
      description: 'Foco LED inteligente con 16 millones de colores.',
      images: ['/images/foco-1.jpg', '/images/foco-2.jpg'],
      category: 'iluminacion',
      isBestseller: true,
      active: true,
    },
    {
      id: 'p-2',
      name: 'Tira LED RGB',
      description: 'Tira LED de 5 metros para iluminación ambiental.',
      images: ['/images/tira-led.jpg'],
      category: 'iluminacion',
      isBestseller: false,
      active: true,
    },
    {
      id: 'p-3',
      name: 'Sensor Sin Imagen',
      description: 'Producto sin imágenes para probar placeholder.',
      images: [],
      category: 'seguridad',
      isBestseller: false,
      active: true,
    },
    {
      id: 'p-5',
      name: 'Lámpara GU10',
      description: 'Lámpara GU10 regulable.',
      images: ['/images/gu10.jpg'],
      category: 'iluminacion',
      isBestseller: false,
      active: true,
    },
    {
      id: 'p-4',
      name: 'Cerradura Inactiva',
      description: 'Producto sin stock, oculto del storefront.',
      images: ['/images/cerradura.jpg'],
      category: 'seguridad',
      isBestseller: false,
      active: false,
    },
  ],
}));

const addItemMock = vi.fn();
let cartItems: { product: { id: string }; quantity: number }[] = [];

vi.mock('@/features/cart/useCart', () => ({
  useCart: () => ({
    items: cartItems,
    addItem: addItemMock,
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
    total: 0,
    itemCount: 0,
    storageAvailable: true,
  }),
}));

// Precio del ERP: por defecto uno fijo por id; cada test puede fijar otro
// (`erpPricing`, para todos) o dejar productos sin stock (`soldOutIds`).
const ERP_PRICES: Record<string, number> = {
  'p-1': 18900,
  'p-2': 28900,
  'p-3': 9500,
  'p-5': 7000,
};
let erpPricing: ProductPricing | null = null;
let soldOutIds: string[] = [];
const pricingOf = (product: { id: string }): ProductPricing =>
  erpPricing ?? {
    price: ERP_PRICES[product.id] ?? null,
    transferPrice: null,
    availability: soldOutIds.includes(product.id) ? 'out_of_stock' : 'available',
  };
vi.mock('@/features/pricing/usePricing', () => ({
  usePricing: () => ({ status: 'ready', pricingOf }),
}));

// La card de "Mirá más productos" se prueba en su propio test: acá alcanza con
// saber qué productos recibe y en qué orden.
vi.mock('@/features/catalog/ProductCard', () => ({
  __esModule: true,
  default: ({ product }: { product: { id: string; name: string } }) => (
    <div data-testid="related-card">{product.name}</div>
  ),
}));

// IntersectionObserver controlable: la barra fija del celular aparece cuando
// el botón principal de compra sale de la pantalla.
type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void;
let observerCallback: ObserverCallback | null = null;
class FakeObserver {
  constructor(callback: ObserverCallback) {
    observerCallback = callback;
  }
  observe = vi.fn();
  disconnect = vi.fn();
}
const scrollPastBuyButton = () => act(() => observerCallback?.([{ isIntersecting: false }]));
const scrollBackToBuyButton = () => act(() => observerCallback?.([{ isIntersecting: true }]));
const stickyBar = () => screen.queryByRole('complementary', { name: /compra rápida/i });

vi.mock('@/features/toast/useToast', () => ({
  useToast: () => ({ addToast: vi.fn(), removeToast: vi.fn(), toasts: [] }),
}));

// `formatPrice` (Intl es-AR) emits a non-breaking space between currency
// symbol and amount; Testing Library's default normaliser collapses ASCII
// whitespace but preserves U+00A0. This matcher compares ignoring all
// Unicode whitespace.
const priceText = (amount: number) => {
  const expected = formatPrice(amount).replace(/\s+/g, '');
  return (content: string) => content.replace(/\s+/g, '') === expected;
};

const offers = () => {
  const script = document.head.querySelector('script[type="application/ld+json"]');
  const datos = JSON.parse(script?.textContent ?? '{}') as {
    offers?: { price: string; availability: string };
  };
  return datos.offers;
};

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <CartProvider>
        <Routes>
          <Route path="/productos/:id" element={<ProductDetailPage />} />
        </Routes>
      </CartProvider>
    </MemoryRouter>,
  );

describe('ProductDetailPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    addItemMock.mockClear();
  });

  afterEach(() => {
    cartItems = [];
    window.localStorage.clear();
    erpPricing = null;
    soldOutIds = [];
    observerCallback = null;
    vi.unstubAllGlobals();
  });

  it('should not let the quantity go above the ERP stock left for the cart', async () => {
    erpPricing = { price: 18900, transferPrice: null, availability: 'available', stock: 3 };
    cartItems = [{ product: { id: 'p-1' }, quantity: 1 }];
    const user = userEvent.setup();
    renderAt('/productos/p-1');

    const increase = screen.getByRole('button', { name: /aumentar cantidad/i });
    await user.click(increase);

    expect(increase).toBeDisabled();
    expect(screen.getByText(/llegaste al máximo de unidades disponibles/i)).toBeInTheDocument();
  });

  it('should block adding when the cart already has all the ERP stock', () => {
    erpPricing = { price: 18900, transferPrice: null, availability: 'available', stock: 2 };
    cartItems = [{ product: { id: 'p-1' }, quantity: 2 }];
    renderAt('/productos/p-1');

    expect(screen.getByRole('button', { name: /agregar al carrito/i })).toBeDisabled();
    expect(screen.getByText(/llegaste al máximo de unidades disponibles/i)).toBeInTheDocument();
  });

  it('should render the product name and price for a valid id', () => {
    renderAt('/productos/p-1');

    expect(
      screen.getByRole('heading', { name: /foco inteligente rgbw/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(priceText(18900))).toBeInTheDocument();
  });

  it('should render the full product description for a valid id', () => {
    renderAt('/productos/p-1');

    expect(
      screen.getByText(/foco led inteligente con 16 millones de colores/i),
    ).toBeInTheDocument();
  });

  it('should show the ERP price and, when lower, the transfer price', () => {
    erpPricing = { price: 31000, transferPrice: 29500, availability: 'available' };
    renderAt('/productos/p-2');

    expect(screen.getByText(priceText(31000))).toBeInTheDocument();
    expect(screen.getByText(priceText(29500))).toBeInTheDocument();
    expect(screen.queryByText(priceText(28900))).not.toBeInTheDocument();
  });

  it('should offer a WhatsApp consult instead of adding to the cart when out of stock', () => {
    erpPricing = { price: 31000, transferPrice: null, availability: 'out_of_stock' };
    renderAt('/productos/p-2');

    expect(screen.getByText(/sin stock/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /agregar al carrito/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /consultar por whatsapp/i })).toBeInTheDocument();
  });

  it('should ask to consult the price when the ERP has none', () => {
    erpPricing = { price: null, transferPrice: null, availability: 'no_price' };
    renderAt('/productos/p-2');

    expect(screen.getByText('Consultar precio')).toBeInTheDocument();
    expect(screen.queryByText(priceText(28900))).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /consultar por whatsapp/i })).toBeInTheDocument();
  });

  it('should disable "Agregar al carrito" while the price is loading', () => {
    erpPricing = { price: null, transferPrice: null, availability: 'loading' };
    renderAt('/productos/p-2');

    expect(screen.getByRole('status', { name: /cargando precio/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /agregar al carrito/i })).toBeDisabled();
  });

  it('should publish the ERP price and stock in the JSON-LD, like the page', () => {
    erpPricing = { price: 31000, transferPrice: null, availability: 'out_of_stock' };
    renderAt('/productos/p-2');

    expect(offers()).toEqual(
      expect.objectContaining({ price: '31000', availability: 'https://schema.org/OutOfStock' }),
    );
  });

  it.each([
    ['no_price', { price: null, transferPrice: null, availability: 'no_price' }],
    ['loading', { price: null, transferPrice: null, availability: 'loading' }],
  ] as const)(
    'should leave the offer out of the JSON-LD when the ERP has no price (%s)',
    (_, pricing) => {
      erpPricing = pricing;
      renderAt('/productos/p-2');

      expect(document.head.querySelector('script[type="application/ld+json"]')).not.toBeNull();
      expect(offers()).toBeUndefined();
    },
  );

  it('should render a thumbnail strip when the product has more than one image', () => {
    renderAt('/productos/p-1');

    const thumbs = screen.getAllByRole('button', { name: /imagen \d/i });
    expect(thumbs.length).toBe(2);
  });

  it('should show the chosen thumbnail as the main image', async () => {
    const user = userEvent.setup();
    renderAt('/productos/p-1');

    expect(screen.getByRole('img', { name: 'Foco Inteligente RGBW' })).toHaveAttribute(
      'src',
      '/images/foco-1.jpg',
    );

    await user.click(screen.getByRole('button', { name: 'Imagen 2' }));

    expect(screen.getByRole('img', { name: 'Foco Inteligente RGBW' })).toHaveAttribute(
      'src',
      '/images/foco-2.jpg',
    );
    expect(screen.getByRole('button', { name: 'Imagen 2' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  it('should not render thumbnails when the product has a single image', () => {
    renderAt('/productos/p-2');

    expect(screen.queryByRole('button', { name: /imagen \d/i })).not.toBeInTheDocument();
  });

  it('should render the breadcrumb Inicio / Catálogo / category / product', () => {
    renderAt('/productos/p-1');

    const breadcrumb = screen.getByRole('navigation', { name: /ruta de navegación/i });
    expect(within(breadcrumb).getByRole('link', { name: /inicio/i })).toHaveAttribute('href', '/');
    expect(within(breadcrumb).getByRole('link', { name: 'Catálogo' })).toHaveAttribute(
      'href',
      '/catalogo',
    );
    expect(within(breadcrumb).getByRole('link', { name: 'iluminacion' })).toHaveAttribute(
      'href',
      '/catalogo?category=iluminacion',
    );
    expect(within(breadcrumb).getByText('Foco Inteligente RGBW')).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('should show the description in its own card', () => {
    renderAt('/productos/p-1');

    const card = screen.getByRole('heading', { name: 'Descripción' }).closest('section')!;
    expect(
      within(card).getByText(/foco led inteligente con 16 millones de colores/i),
    ).toBeInTheDocument();
  });

  describe('ahorro por transferencia', () => {
    it('should show how much the transfer saves and the discount badge', () => {
      erpPricing = { price: 31000, transferPrice: 29500, availability: 'available' };
      renderAt('/productos/p-2');

      expect(
        screen.getByText(
          (text) => text.replace(/\s+/g, ' ') === 'Ahorrás $ 1.500 pagando por transferencia',
        ),
      ).toBeInTheDocument();
      expect(screen.getByText(/-5% transferencia/i)).toBeInTheDocument();
    });

    it('should not show any saving without a cheaper transfer price', () => {
      erpPricing = { price: 31000, transferPrice: null, availability: 'available' };
      renderAt('/productos/p-2');

      expect(screen.queryByText(/ahorrás/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/% transferencia/i)).not.toBeInTheDocument();
    });
  });

  describe('Mirá más productos', () => {
    const relatedNames = () =>
      within(screen.getByRole('heading', { name: /mirá más productos/i }).closest('section')!)
        .getAllByTestId('related-card')
        .map((card) => card.textContent);

    it('should show other products of the same category first, then the rest', () => {
      renderAt('/productos/p-1');

      expect(relatedNames()).toEqual(['Tira LED RGB', 'Lámpara GU10', 'Sensor Sin Imagen']);
    });

    it('should put the products without stock last', () => {
      soldOutIds = ['p-2'];
      renderAt('/productos/p-1');

      expect(relatedNames()).toEqual(['Lámpara GU10', 'Sensor Sin Imagen', 'Tira LED RGB']);
    });

    it('should link to the whole catalog', () => {
      renderAt('/productos/p-1');

      expect(screen.getByRole('link', { name: /ver todo el catálogo/i })).toHaveAttribute(
        'href',
        '/catalogo',
      );
    });
  });

  describe('barra fija del celular', () => {
    beforeEach(() => {
      vi.stubGlobal('IntersectionObserver', FakeObserver);
    });

    it('should appear only once the main buy button scrolls out of view', () => {
      renderAt('/productos/p-1');
      expect(stickyBar()).toBeNull();

      scrollPastBuyButton();
      expect(stickyBar()).not.toBeNull();
      expect(within(stickyBar()!).getByText('Foco Inteligente RGBW')).toBeInTheDocument();
      expect(within(stickyBar()!).getByText(priceText(18900))).toBeInTheDocument();

      scrollBackToBuyButton();
      expect(stickyBar()).toBeNull();
    });

    it('should show the transfer price when it is cheaper', () => {
      erpPricing = { price: 31000, transferPrice: 29500, availability: 'available' };
      renderAt('/productos/p-2');
      scrollPastBuyButton();

      expect(within(stickyBar()!).getByText(priceText(29500))).toBeInTheDocument();
    });

    it('should add the same quantity as the main button', async () => {
      const user = userEvent.setup();
      renderAt('/productos/p-1');
      await user.click(screen.getByRole('button', { name: /aumentar cantidad/i }));
      scrollPastBuyButton();

      await user.click(within(stickyBar()!).getByRole('button', { name: 'Agregar' }));

      expect(addItemMock).toHaveBeenCalledWith(expect.objectContaining({ id: 'p-1' }), 2);
    });

    it('should disable "Agregar" when the cart already has all the stock', () => {
      erpPricing = { price: 18900, transferPrice: null, availability: 'available', stock: 1 };
      cartItems = [{ product: { id: 'p-1' }, quantity: 1 }];
      renderAt('/productos/p-1');
      scrollPastBuyButton();

      expect(within(stickyBar()!).getByRole('button', { name: 'Agregar' })).toBeDisabled();
    });

    it('should offer a WhatsApp consult when the product is out of stock', () => {
      erpPricing = { price: 31000, transferPrice: null, availability: 'out_of_stock' };
      renderAt('/productos/p-2');
      scrollPastBuyButton();

      expect(within(stickyBar()!).queryByRole('button', { name: 'Agregar' })).toBeNull();
      expect(within(stickyBar()!).getByRole('link', { name: 'Consultar' })).toHaveAttribute(
        'href',
        expect.stringContaining('wa.me'),
      );
    });

    it('should not show a price while the ERP has none', () => {
      erpPricing = { price: null, transferPrice: null, availability: 'no_price' };
      renderAt('/productos/p-2');
      scrollPastBuyButton();

      expect(within(stickyBar()!).getByText('Consultar precio')).toBeInTheDocument();
      expect(within(stickyBar()!).getByRole('link', { name: 'Consultar' })).toBeInTheDocument();
    });
  });

  it('should render a placeholder when the product has no images', () => {
    renderAt('/productos/p-3');

    expect(screen.getByRole('img', { name: /sin imagen/i })).toBeInTheDocument();
  });

  it('should show a 404 message and a link to /catalogo when the id does not match any product', () => {
    renderAt('/productos/does-not-exist');

    expect(screen.getByText(/404/i)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /volver al catálogo/i });
    expect(link).toHaveAttribute('href', '/catalogo');
  });

  it('should show the same 404 message when the matching product is inactive (out of stock)', () => {
    renderAt('/productos/p-4');

    expect(screen.getByText(/404/i)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /volver al catálogo/i });
    expect(link).toHaveAttribute('href', '/catalogo');
  });

  it('should start again at 1 when navigating to another product', async () => {
    // Antes la cantidad elegida seguía al ir a otro producto (por ejemplo desde
    // "Mirá más productos"): la página no se remontaba.
    function GoToOther() {
      const navigate = useNavigate();
      return (
        <button type="button" onClick={() => void navigate('/productos/p-2')}>
          ir a otro producto
        </button>
      );
    }
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/productos/p-1']}>
        <CartProvider>
          <GoToOther />
          <Routes>
            <Route path="/productos/:id" element={<ProductDetailPage />} />
          </Routes>
        </CartProvider>
      </MemoryRouter>,
    );
    const increase = screen.getByRole('button', { name: /aumentar cantidad/i });
    await user.click(increase);
    await user.click(increase);
    expect(screen.getByLabelText('Cantidad')).toHaveTextContent('3');

    await user.click(screen.getByRole('button', { name: 'ir a otro producto' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Tira LED RGB' })).toBeInTheDocument();
    expect(screen.getByLabelText('Cantidad')).toHaveTextContent('1');
  });

  it('should start the QuantitySelector at 1 with the decrement button disabled', () => {
    renderAt('/productos/p-1');

    const decrement = screen.getByRole('button', { name: /disminuir cantidad/i });
    const increment = screen.getByRole('button', { name: /aumentar cantidad/i });
    const quantityRegion = decrement.parentElement!;
    expect(within(quantityRegion).getByText('1')).toBeInTheDocument();
    expect(decrement).toBeDisabled();
    expect(increment).not.toBeDisabled();
  });

  it('should call addItem with the product and the selected quantity when "Agregar al carrito" is clicked', async () => {
    const user = userEvent.setup();
    renderAt('/productos/p-1');

    const increment = screen.getByRole('button', { name: /aumentar cantidad/i });
    await user.click(increment);
    await user.click(increment);

    const addButton = screen.getByRole('button', { name: /agregar al carrito/i });
    await user.click(addButton);

    expect(addItemMock).toHaveBeenCalledTimes(1);
    expect(addItemMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'p-1', name: 'Foco Inteligente RGBW' }),
      3,
    );
  });
});
