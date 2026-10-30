// Resumen del pedido en `/checkout`: ítems, total del medio elegido, cómo se
// paga y la entrega (retiro en el local).
import { formatPrice } from '@/lib/formatPrice';
import type { CartItem } from '@/types';
import type { PaymentMethod } from './ordersApi';

interface CheckoutSummaryProps {
  items: CartItem[];
  total: number;
  paymentMethod: PaymentMethod;
}

const PAYMENT_TEXT: Record<PaymentMethod, string> = {
  transfer: 'transferencia bancaria. Después de confirmar te mostramos a qué cuenta transferir.',
  mercado_pago: 'Mercado Pago. Después de confirmar te llevamos a Mercado Pago para pagar.',
};

export default function CheckoutSummary({ items, total, paymentMethod }: CheckoutSummaryProps) {
  return (
    <aside className="flex flex-col gap-3 rounded-md border border-border bg-card p-4">
      <h2 className="text-base font-semibold text-foreground">Tu pedido</h2>
      <ul className="flex flex-col gap-1 text-sm text-foreground">
        {items.map((item) => (
          <li key={item.product.id}>
            {item.quantity} × {item.product.name}
          </li>
        ))}
      </ul>
      <p data-testid="checkout-total" className="text-base font-semibold text-foreground">
        Total: <span className="font-mono">{formatPrice(total)}</span>
      </p>
      <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
        <li>
          <strong className="text-foreground">Pago:</strong> {PAYMENT_TEXT[paymentMethod]}
        </li>
        <li>
          <strong className="text-foreground">Entrega:</strong> retiro en el local. Para envíos,
          escribinos por WhatsApp desde el carrito.
        </li>
      </ul>
    </aside>
  );
}
