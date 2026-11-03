// CheckoutBlocked — el checkout no se puede usar todavía (carrito vacío,
// precios cargando, productos sin precio o sin stock): por qué, y a dónde ir.
import { Link } from 'react-router-dom';
import { getWhatsAppNumber } from '@/lib/env';

interface CheckoutBlockedProps {
  message: string;
}

const linkClass =
  'inline-flex min-h-11 items-center rounded text-label-lg font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

export default function CheckoutBlocked({ message }: CheckoutBlockedProps) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm">
      <p className="text-body-lg text-secondary">{message}</p>
      <div className="flex flex-wrap gap-x-6">
        <Link to="/carrito" className={linkClass}>
          Volver al carrito
        </Link>
        <a
          href={`https://wa.me/${getWhatsAppNumber()}`}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          Escribinos por WhatsApp
        </a>
      </div>
    </div>
  );
}
