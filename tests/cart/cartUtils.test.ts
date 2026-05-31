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
