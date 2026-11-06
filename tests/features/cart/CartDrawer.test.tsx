import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider } from '@/features/cart/CartProvider';
import CartDrawer from '@/features/cart/CartDrawer';
import { useCart } from '@/features/cart/useCart';
import { formatPrice } from '@/lib/formatPrice';
import { buildProduct } from '../../helpers/builders';
import type { Product, ProductPricing } from '@/types';

// Precio del ERP que fija cada test; por defecto con Mercado Pago más caro.
const withMercadoPago = (): ProductPricing => ({
  price: 21000,
  transferPrice: 20000,
  availability: 'available',
});
let pricingOf: (product: Product) => ProductPricing = withMercadoPago;
vi.mock('@/features/pricing/usePricing', () => ({
  usePricing: () => ({ status: 'ready', pricingOf: (product: Product) => pricingOf(product) }),
}));

const addToast = vi.fn();
vi.mock('@/features/toast/useToast', () => ({
  useToast: () => ({ toasts: [], addToast, removeToast: vi.fn() }),
}));

const plain = (text: string | null) => (text ?? '').replace(/\u00A0/g, ' ');
const price = (amount: number) => plain(formatPrice(amount));

// El drawer se abre desde el header; acá, con un botón que llama a `openCart`.
function OpenCartButton() {
  const { openCart } = useCart();
  return (
    <button type="button" onClick={openCart}>
      Abrir carrito
    </button>
  );
}

const seedCart = (lines: { product: Product; quantity: number }[]) =>
  window.localStorage.setItem('ezyhome_cart', JSON.stringify(lines));

const renderOpenDrawer = async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <CartProvider>
        <OpenCartButton />
        <CartDrawer />
      </CartProvider>
    </MemoryRouter>,
  );
  await user.click(screen.getByRole('button', { name: 'Abrir carrito' }));
  return { user, dialog: screen.getByRole('dialog') };
};

describe('CartDrawer', () => {
  beforeEach(() => {
    window.localStorage.clear();
    seedCart([{ product: buildProduct({ id: 'p-1', name: 'Foco Inteligente' }), quantity: 2 }]);
  });

  afterEach(() => {
    window.localStorage.clear();
    pricingOf = withMercadoPago;
    addToast.mockClear();
    vi.restoreAllMocks();
  });

  it('should title the dialog with the total units in the cart', async () => {
    seedCart([
      { product: buildProduct({ id: 'p-1', name: 'Foco Inteligente' }), quantity: 2 },
      { product: buildProduct({ id: 'p-2', name: 'Enchufe WiFi' }), quantity: 1 },
    ]);
    await renderOpenDrawer();

    expect(screen.getByRole('dialog', { name: 'Tu carrito (3)' })).toBeInTheDocument();
  });

  it('should show the row line total with the transfer price and no per-unit MP price', async () => {
    const { dialog } = await renderOpenDrawer();

    const row = within(dialog).getByText('Foco Inteligente').closest('li')!;
    expect(plain(row.textContent)).toContain(price(40000));
    expect(row).not.toHaveTextContent(/mercado pago|c\/u/i);
    expect(row).not.toHaveTextContent('Iluminación Inteligente');
  });

  it('should show "Consultar precio" in a row without ERP price', async () => {
    pricingOf = () => ({ price: null, transferPrice: null, availability: 'no_price' });
    const { dialog } = await renderOpenDrawer();

    const row = within(dialog).getByText('Foco Inteligente').closest('li')!;
    expect(row).toHaveTextContent('Consultar precio');
  });

  it('should remove the product with the trash button and tell it with a toast', async () => {
    const { user, dialog } = await renderOpenDrawer();

    await user.click(
      within(dialog).getByRole('button', { name: 'Quitar Foco Inteligente del carrito' }),
    );

    expect(within(dialog).queryByText('Foco Inteligente')).not.toBeInTheDocument();
    expect(addToast).toHaveBeenCalledWith('Foco Inteligente eliminado del carrito', 'info');
  });

  it('should stop adding units at the ERP stock with a friendly notice', async () => {
    pricingOf = () => ({ ...withMercadoPago(), stock: 2 });
    const { dialog } = await renderOpenDrawer();

    expect(within(dialog).getByRole('button', { name: 'Aumentar cantidad' })).toBeDisabled();
    expect(within(dialog).getByText(/llegaste al máximo/i)).toBeInTheDocument();
  });

  it('should label the subtotal with the units, in plural', async () => {
    const { dialog } = await renderOpenDrawer();

    const subtotal = within(dialog).getByText('Subtotal (2 productos)').parentElement!;
    expect(plain(subtotal.textContent)).toContain(price(40000));
  });

  it('should label the subtotal in singular with a single unit', async () => {
    seedCart([{ product: buildProduct({ id: 'p-1' }), quantity: 1 }]);
    const { dialog } = await renderOpenDrawer();

    expect(within(dialog).getByText('Subtotal (1 producto)')).toBeInTheDocument();
  });

  it('should say shipping is arranged over WhatsApp', async () => {
    const { dialog } = await renderOpenDrawer();

    const shipping = within(dialog).getByText('Envío').parentElement!;
    expect(shipping).toHaveTextContent('Lo coordinamos por WhatsApp');
  });

  it('should show the transfer total big and the Mercado Pago total below when higher', async () => {
    const { dialog } = await renderOpenDrawer();

    expect(within(dialog).getByTestId('main-total')).toHaveTextContent(/total con transferencia/i);
    expect(plain(within(dialog).getByTestId('main-total').textContent)).toContain(price(40000));
    expect(plain(within(dialog).getByTestId('secondary-total').textContent)).toContain(
      `Con Mercado Pago: ${price(42000)}`,
    );
  });

  it('should hide the Mercado Pago total when there is a single price', async () => {
    pricingOf = () => ({ price: 20000, transferPrice: null, availability: 'available' });
    const { dialog } = await renderOpenDrawer();

    expect(within(dialog).queryByTestId('secondary-total')).not.toBeInTheDocument();
  });

  it('should offer "Iniciar compra" to /checkout and close the drawer on tap', async () => {
    const { user, dialog } = await renderOpenDrawer();

    const start = within(dialog).getByRole('link', { name: 'Iniciar compra' });
    expect(start).toHaveAttribute('href', '/checkout');
    await user.click(start);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should not offer "Iniciar compra" while a product has no price, and keep WhatsApp', async () => {
    pricingOf = () => ({ price: null, transferPrice: null, availability: 'no_price' });
    const { dialog } = await renderOpenDrawer();

    expect(within(dialog).queryByRole('link', { name: 'Iniciar compra' })).not.toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Comprar por WhatsApp' })).toBeEnabled();
    expect(
      within(dialog).getByText('Los productos sin precio te los cotizamos por WhatsApp.'),
    ).toBeInTheDocument();
  });

  it('should open WhatsApp with the order and close the drawer', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const { user, dialog } = await renderOpenDrawer();

    await user.click(within(dialog).getByRole('button', { name: 'Comprar por WhatsApp' }));

    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(String(openSpy.mock.calls[0]?.[0])).toMatch(/^https:\/\/wa\.me\//);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should close the drawer with "Seguir comprando"', async () => {
    const { user, dialog } = await renderOpenDrawer();

    await user.click(within(dialog).getByRole('button', { name: 'Seguir comprando' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should show the empty-cart message with a link to the catalog', async () => {
    window.localStorage.clear();
    const { dialog } = await renderOpenDrawer();

    expect(screen.getByRole('dialog', { name: 'Tu carrito (0)' })).toBeInTheDocument();
    expect(within(dialog).getByText('Tu carrito está vacío.')).toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: 'Ver productos' })).toHaveAttribute(
      'href',
      '/catalogo',
    );
  });
});
