import CartContents from './CartContents';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

export default function CartPage() {
  // El carrito es estado privado del visitante: no hay nada que indexar.
  useDocumentMeta({
    title: 'Carrito',
    description: 'Revisá los productos que elegiste y cerrá tu compra por WhatsApp.',
    path: '/carrito',
    noIndex: true,
  });

  return (
    <section className="mx-auto w-full max-w-content px-4 py-8 sm:py-12">
      <h1 className="mb-6 text-2xl font-semibold text-foreground sm:text-3xl">Mi Carrito</h1>
      <CartContents />
    </section>
  );
}
