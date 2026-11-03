import { describe, expect, it } from 'vitest';
import {
  buildWhatsAppMessage,
  cartHeaderTotal,
  cartLinePrice,
  computeCartTotals,
} from '@/features/cart/cartUtils';
import { formatPrice } from '@/lib/formatPrice';
import type { CartItem, Product, ProductPricing } from '@/types';
import { buildProduct as buildBaseProduct } from '../../helpers/builders';

const buildProduct = (overrides: Partial<Product> = {}): Product =>
  buildBaseProduct({
    name: 'Smart Bulb RGBW',
    description: 'Foco LED inteligente Wi-Fi 9W RGBW',
    images: ['/images/bulb.jpg'],
    ...overrides,
  });

// Precio del ERP de cada producto armado con `buildItem`, por id. El producto
// ya no tiene precio propio: el precio de venta viene del ERP.
const erpPrices = new Map<string, number>();

const buildItem = (
  { price = 15000, ...productOverrides }: Partial<Product> & { price?: number } = {},
  quantity = 1,
): CartItem => {
  const product = buildProduct(productOverrides);
  erpPrices.set(product.id, price);
  return { product, quantity };
};

const PHONE_NUMBER = '5491112345678';

const pricedFromErp = (product: Product): ProductPricing => ({
  price: erpPrices.get(product.id) ?? null,
  transferPrice: null,
  availability: 'available',
});

describe('buildWhatsAppMessage', () => {
  it('should produce a URL that starts with https://wa.me/ when called with any items', () => {
    const items: CartItem[] = [buildItem()];

    const url = buildWhatsAppMessage(items, PHONE_NUMBER, pricedFromErp);

    expect(url.startsWith('https://wa.me/')).toBe(true);
  });

  it('should embed the phone number in the URL when called', () => {
    const items: CartItem[] = [buildItem()];

    const url = buildWhatsAppMessage(items, PHONE_NUMBER, pricedFromErp);

    expect(url).toContain(`https://wa.me/${PHONE_NUMBER}?text=`);
  });

  it('should encodeURIComponent the message when embedding in the URL', () => {
    const items: CartItem[] = [buildItem({ id: 'p-1', name: 'Smart Bulb RGBW', price: 15000 }, 2)];

    const url = buildWhatsAppMessage(items, PHONE_NUMBER, pricedFromErp);
    const textParam = url.split('?text=')[1] ?? '';

    // Encoded text must contain percent-encoded characters
    // (newlines, spaces, accents, $ sign all get encoded).
    expect(textParam).toContain('%');
    // The raw, unencoded message must NOT appear directly in the URL.
    expect(url).not.toContain('Hola! Quiero hacer un pedido:');
    // Decoding should recover the original message.
    expect(decodeURIComponent(textParam)).toContain('Hola! Quiero hacer un pedido:');
  });

  it('should include every product name in the decoded message when multiple items are provided', () => {
    const items: CartItem[] = [
      buildItem({ id: 'p-1', name: 'Smart Bulb RGBW', price: 15000 }, 2),
      buildItem({ id: 'p-2', name: 'Sensor de Gas', price: 8500 }, 1),
    ];

    const url = buildWhatsAppMessage(items, PHONE_NUMBER, pricedFromErp);
    const decoded = decodeURIComponent(url.split('?text=')[1] ?? '');

    expect(decoded).toContain('Smart Bulb RGBW');
    expect(decoded).toContain('Sensor de Gas');
  });

  it('should include the correct subtotal when called with multiple items', () => {
    const items: CartItem[] = [
      buildItem({ id: 'p-1', name: 'Smart Bulb RGBW', price: 15000 }, 2),
      buildItem({ id: 'p-2', name: 'Sensor de Gas', price: 8500 }, 1),
    ];
    const expectedSubtotal = 15000 * 2 + 8500 * 1;

    const url = buildWhatsAppMessage(items, PHONE_NUMBER, pricedFromErp);
    const decoded = decodeURIComponent(url.split('?text=')[1] ?? '');

    expect(decoded).toContain(`Subtotal: ${formatPrice(expectedSubtotal)}`);
  });

  it('should produce a valid message when called with a single item', () => {
    const items: CartItem[] = [buildItem({ id: 'p-1', name: 'Smart Bulb RGBW', price: 15000 }, 1)];

    const url = buildWhatsAppMessage(items, PHONE_NUMBER, pricedFromErp);
    const decoded = decodeURIComponent(url.split('?text=')[1] ?? '');

    expect(decoded).toContain('1x Smart Bulb RGBW');
    expect(decoded).toContain(`Subtotal: ${formatPrice(15000)}`);
    expect(decoded).toContain('(Los precios no incluyen envío)');
  });

  it('should format prices with the es-AR locale when rendering line items', () => {
    const items: CartItem[] = [buildItem({ price: 15000 }, 2)];

    const url = buildWhatsAppMessage(items, PHONE_NUMBER, pricedFromErp);
    const decoded = decodeURIComponent(url.split('?text=')[1] ?? '');

    // es-AR currency formatting yields a "$" prefix and "." as thousands separator.
    // We assert via formatPrice to stay locale-implementation-agnostic.
    expect(decoded).toContain(`${formatPrice(15000)} c/u`);
  });
});

describe('buildWhatsAppMessage — precios del ERP', () => {
  it('should add the transfer total when it is lower than the Mercado Pago total', () => {
    const items: CartItem[] = [buildItem({ price: 21000 }, 2)];
    const pricingOf = (): ProductPricing => ({
      price: 21000,
      transferPrice: 20000,
      availability: 'available',
    });

    const url = buildWhatsAppMessage(items, PHONE_NUMBER, pricingOf);
    const decoded = decodeURIComponent(url.split('?text=')[1] ?? '');

    expect(decoded).toContain(`Subtotal: ${formatPrice(42000)}`);
    expect(decoded).toContain(`Con transferencia: ${formatPrice(40000)}`);
  });

  it('should list a product without ERP price as a question and leave it out of the subtotal', () => {
    const items: CartItem[] = [
      buildItem({ id: 'p-1', name: 'Sensor', price: 10000 }, 1),
      buildItem({ id: 'p-2', name: 'Válvula', price: 99000 }, 1),
    ];
    const pricingOf = (product: Product): ProductPricing =>
      product.id === 'p-1'
        ? pricedFromErp(product)
        : { price: null, transferPrice: null, availability: 'no_price' };

    const url = buildWhatsAppMessage(items, PHONE_NUMBER, pricingOf);
    const decoded = decodeURIComponent(url.split('?text=')[1] ?? '');

    expect(decoded).toContain('1x Válvula → consultar precio');
    expect(decoded).toContain(`Subtotal: ${formatPrice(10000)}`);
  });
});

describe('computeCartTotals', () => {
  it('should add up the Mercado Pago and transfer totals', () => {
    const items: CartItem[] = [
      buildItem({ id: 'p-1', price: 21000 }, 2),
      buildItem({ id: 'p-2', price: 5000 }, 1),
    ];
    const pricingOf = (product: Product): ProductPricing => ({
      price: erpPrices.get(product.id) ?? null,
      transferPrice: product.id === 'p-1' ? 20000 : null,
      availability: 'available',
    });

    expect(computeCartTotals(items, pricingOf)).toEqual({
      total: 21000 * 2 + 5000,
      transferTotal: 20000 * 2 + 5000,
      hasUnpriced: false,
    });
  });

  it('should skip products without ERP price and flag them', () => {
    const items: CartItem[] = [buildItem({ price: 21000 }, 1)];
    const pricingOf = (): ProductPricing => ({
      price: null,
      transferPrice: null,
      availability: 'no_price',
    });

    expect(computeCartTotals(items, pricingOf)).toEqual({
      total: 0,
      transferTotal: 0,
      hasUnpriced: true,
    });
  });
});

describe('cartHeaderTotal', () => {
  it('should show the transfer total, labeled, when it is lower than the Mercado Pago one', () => {
    expect(cartHeaderTotal({ total: 21_000, transferTotal: 20_000, hasUnpriced: false })).toEqual({
      amount: 20_000,
      label: 'Con transferencia',
    });
  });

  it('should show a plain total when there is a single price', () => {
    expect(cartHeaderTotal({ total: 20_000, transferTotal: 20_000, hasUnpriced: false })).toEqual({
      amount: 20_000,
      label: 'Total',
    });
  });

  it('should hide the total when some product has no ERP price', () => {
    // Un total parcial engaña: el visitante cree que eso es lo que paga.
    expect(cartHeaderTotal({ total: 20_000, transferTotal: 20_000, hasUnpriced: true })).toBeNull();
  });

  it('should hide the total when the cart is empty', () => {
    expect(cartHeaderTotal({ total: 0, transferTotal: 0, hasUnpriced: false })).toBeNull();
  });
});

describe('cartLinePrice', () => {
  it('should price the row with the transfer price when it is cheaper, with the MP price aside', () => {
    expect(
      cartLinePrice({ price: 26_300, transferPrice: 25_000, availability: 'available' }, 2),
    ).toEqual({ unit: 25_000, line: 50_000, byTransfer: true, mercadoPagoUnit: 26_300 });
  });

  it('should keep the single price as today without a transfer price (MP off)', () => {
    expect(
      cartLinePrice({ price: 25_000, transferPrice: null, availability: 'available' }, 3),
    ).toEqual({ unit: 25_000, line: 75_000, byTransfer: false, mercadoPagoUnit: null });
  });

  it('should be null without an ERP price', () => {
    expect(
      cartLinePrice({ price: null, transferPrice: null, availability: 'no_price' }, 1),
    ).toBeNull();
  });

  it('should add up to the cart transfer total, like the summary', () => {
    const lamp = buildProduct({ id: 'a' });
    const sensor = buildProduct({ id: 'b' });
    const prices: Record<string, ProductPricing> = {
      a: { price: 26_300, transferPrice: 25_000, availability: 'available' },
      b: { price: 9_000, transferPrice: null, availability: 'available' },
    };
    const pricingOf = (product: Product) => prices[product.id]!;
    const items: CartItem[] = [
      { product: lamp, quantity: 2 },
      { product: sensor, quantity: 1 },
    ];

    const sum = items.reduce(
      (total, item) => total + (cartLinePrice(pricingOf(item.product), item.quantity)?.line ?? 0),
      0,
    );
    expect(sum).toBe(computeCartTotals(items, pricingOf).transferTotal);
  });
});
