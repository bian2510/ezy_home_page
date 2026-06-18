import { describe, expect, it } from 'vitest';
import { buildWhatsAppMessage } from '@/features/cart/cartUtils';
import { formatPrice } from '@/types';
import type { CartItem, Product } from '@/types';

const buildProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'p-1',
  name: 'Smart Bulb RGBW',
  description: 'Foco LED inteligente Wi-Fi 9W RGBW',
  price: 15000,
  images: ['/images/bulb.jpg'],
  category: 'iluminacion',
  isBestseller: false,
  isOnSale: false,
  active: true,
  ...overrides,
});

const buildItem = (productOverrides: Partial<Product> = {}, quantity = 1): CartItem => ({
  product: buildProduct(productOverrides),
  quantity,
});

const PHONE_NUMBER = '5491112345678';

describe('buildWhatsAppMessage', () => {
  it('should produce a URL that starts with https://wa.me/ when called with any items', () => {
    const items: CartItem[] = [buildItem()];

    const url = buildWhatsAppMessage(items, PHONE_NUMBER);

    expect(url.startsWith('https://wa.me/')).toBe(true);
  });

  it('should embed the phone number in the URL when called', () => {
    const items: CartItem[] = [buildItem()];

    const url = buildWhatsAppMessage(items, PHONE_NUMBER);

    expect(url).toContain(`https://wa.me/${PHONE_NUMBER}?text=`);
  });

  it('should encodeURIComponent the message when embedding in the URL', () => {
    const items: CartItem[] = [buildItem({ id: 'p-1', name: 'Smart Bulb RGBW', price: 15000 }, 2)];

    const url = buildWhatsAppMessage(items, PHONE_NUMBER);
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

    const url = buildWhatsAppMessage(items, PHONE_NUMBER);
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

    const url = buildWhatsAppMessage(items, PHONE_NUMBER);
    const decoded = decodeURIComponent(url.split('?text=')[1] ?? '');

    expect(decoded).toContain(`Subtotal: ${formatPrice(expectedSubtotal)}`);
  });

  it('should produce a valid message when called with a single item', () => {
    const items: CartItem[] = [buildItem({ id: 'p-1', name: 'Smart Bulb RGBW', price: 15000 }, 1)];

    const url = buildWhatsAppMessage(items, PHONE_NUMBER);
    const decoded = decodeURIComponent(url.split('?text=')[1] ?? '');

    expect(decoded).toContain('1x Smart Bulb RGBW');
    expect(decoded).toContain(`Subtotal: ${formatPrice(15000)}`);
    expect(decoded).toContain('(Los precios no incluyen envío)');
  });

  it('should format prices with the es-AR locale when rendering line items', () => {
    const items: CartItem[] = [buildItem({ price: 15000 }, 2)];

    const url = buildWhatsAppMessage(items, PHONE_NUMBER);
    const decoded = decodeURIComponent(url.split('?text=')[1] ?? '');

    // es-AR currency formatting yields a "$" prefix and "." as thousands separator.
    // We assert via formatPrice to stay locale-implementation-agnostic.
    expect(decoded).toContain(`${formatPrice(15000)} c/u`);
  });
});

describe('buildWhatsAppMessage — precios promocionales', () => {
  it('should use promotionalPrice in line item when product isOnSale', () => {
    const items: CartItem[] = [
      buildItem({ isOnSale: true, price: 15000, promotionalPrice: 9000 }, 1),
    ];

    const url = buildWhatsAppMessage(items, PHONE_NUMBER);
    const decoded = decodeURIComponent(url.split('?text=')[1] ?? '');

    expect(decoded).toContain(formatPrice(9000));
    expect(decoded).not.toContain(formatPrice(15000));
  });

  it('should use promotionalPrice in subtotal when product isOnSale', () => {
    const items: CartItem[] = [
      buildItem({ isOnSale: true, price: 15000, promotionalPrice: 9000 }, 2),
    ];

    const url = buildWhatsAppMessage(items, PHONE_NUMBER);
    const decoded = decodeURIComponent(url.split('?text=')[1] ?? '');

    expect(decoded).toContain(`Subtotal: ${formatPrice(9000 * 2)}`);
    expect(decoded).not.toContain(`Subtotal: ${formatPrice(15000 * 2)}`);
  });

  it('should use regular price when isOnSale is false even if promotionalPrice is defined', () => {
    const items: CartItem[] = [
      buildItem({ isOnSale: false, price: 15000, promotionalPrice: 9000 }, 1),
    ];

    const url = buildWhatsAppMessage(items, PHONE_NUMBER);
    const decoded = decodeURIComponent(url.split('?text=')[1] ?? '');

    expect(decoded).toContain(formatPrice(15000));
  });

  it('should compute correct subtotal in mixed cart with sale and regular products', () => {
    const items: CartItem[] = [
      buildItem({ id: 'p-1', isOnSale: true, price: 15000, promotionalPrice: 9000 }, 2),
      buildItem({ id: 'p-2', isOnSale: false, price: 8500 }, 1),
    ];
    const expectedSubtotal = 9000 * 2 + 8500 * 1;

    const url = buildWhatsAppMessage(items, PHONE_NUMBER);
    const decoded = decodeURIComponent(url.split('?text=')[1] ?? '');

    expect(decoded).toContain(`Subtotal: ${formatPrice(expectedSubtotal)}`);
  });
});

describe('buildWhatsAppMessage — promoción 2x1', () => {
  it('should display doubled quantity for a 2x1 product', () => {
    const items: CartItem[] = [
      buildItem(
        {
          name: 'Lámpara GU10',
          isOnSale: true,
          price: 50000,
          promotionalPrice: 22000,
          promotionBadge: '2x1',
        },
        1,
      ),
    ];

    const url = buildWhatsAppMessage(items, PHONE_NUMBER);
    const decoded = decodeURIComponent(url.split('?text=')[1] ?? '');

    expect(decoded).toContain('2x Lámpara GU10');
  });

  it('should include the (2x1) label in the line item', () => {
    const items: CartItem[] = [
      buildItem(
        { isOnSale: true, price: 50000, promotionalPrice: 22000, promotionBadge: '2x1' },
        1,
      ),
    ];

    const url = buildWhatsAppMessage(items, PHONE_NUMBER);
    const decoded = decodeURIComponent(url.split('?text=')[1] ?? '');

    expect(decoded).toContain('(2x1)');
  });

  it('should show "el par" instead of "c/u" for 2x1 products', () => {
    const items: CartItem[] = [
      buildItem(
        { isOnSale: true, price: 50000, promotionalPrice: 22000, promotionBadge: '2x1' },
        1,
      ),
    ];

    const url = buildWhatsAppMessage(items, PHONE_NUMBER);
    const decoded = decodeURIComponent(url.split('?text=')[1] ?? '');

    expect(decoded).toContain('el par');
    expect(decoded).not.toContain('c/u');
  });

  it('should use promotionalPrice as the price per pair for 2x1 products', () => {
    const items: CartItem[] = [
      buildItem(
        { isOnSale: true, price: 50000, promotionalPrice: 22000, promotionBadge: '2x1' },
        1,
      ),
    ];

    const url = buildWhatsAppMessage(items, PHONE_NUMBER);
    const decoded = decodeURIComponent(url.split('?text=')[1] ?? '');

    expect(decoded).toContain(formatPrice(22000));
    expect(decoded).not.toContain(formatPrice(50000));
  });

  it('should scale physical units and subtotal correctly when quantity > 1 for 2x1', () => {
    const items: CartItem[] = [
      buildItem(
        {
          name: 'Lámpara GU10',
          isOnSale: true,
          price: 50000,
          promotionalPrice: 22000,
          promotionBadge: '2x1',
        },
        2,
      ),
    ];

    const url = buildWhatsAppMessage(items, PHONE_NUMBER);
    const decoded = decodeURIComponent(url.split('?text=')[1] ?? '');

    // 2 sets → 4 physical units shown
    expect(decoded).toContain('4x Lámpara GU10');
    // Subtotal = 2 sets × $22.000 (not doubled quantity × price)
    expect(decoded).toContain(`Subtotal: ${formatPrice(22000 * 2)}`);
  });

  it('should compute correct subtotal in a cart with 2x1 and regular products', () => {
    const items: CartItem[] = [
      buildItem(
        {
          id: 'p-1',
          name: 'Lámpara GU10',
          isOnSale: true,
          price: 50000,
          promotionalPrice: 22000,
          promotionBadge: '2x1',
        },
        1,
      ),
      buildItem({ id: 'p-2', name: 'Sensor de Gas', price: 8500 }, 1),
    ];
    // Subtotal = 1 par × $22.000 + 1 × $8.500
    const expectedSubtotal = 22000 + 8500;

    const url = buildWhatsAppMessage(items, PHONE_NUMBER);
    const decoded = decodeURIComponent(url.split('?text=')[1] ?? '');

    expect(decoded).toContain(`Subtotal: ${formatPrice(expectedSubtotal)}`);
  });
});
