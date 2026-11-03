// CartPage — `/carrito`: el primer paso de la compra. Lista a la izquierda y
// resumen a la derecha (abajo en el celular), con el lenguaje del checkout.
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { PURCHASE_STEP, PURCHASE_STEPS, PURCHASE_STEPS_LABEL } from '@/data/purchaseSteps';
import SectionBand from '@/components/ui/SectionBand';
import Stepper from '@/components/ui/Stepper';
import CartItemList from './CartItemList';
import CartSummary from './CartSummary';
import { EmptyCartMessage, StorageNotice } from './CartContents';
import { useCartContents } from './useCartContents';

const card = 'rounded-xl bg-surface-container-lowest p-6 shadow-sm';

export default function CartPage() {
  // El carrito es estado privado del visitante: no hay nada que indexar.
  useDocumentMeta({
    title: 'Carrito',
    description: 'Revisá los productos que elegiste y cerrá tu compra por WhatsApp.',
    path: '/carrito',
    noIndex: true,
  });
  const cart = useCartContents();

  return (
    <div className="flex flex-col">
      <SectionBand tone="low" className="py-6">
        <Stepper label={PURCHASE_STEPS_LABEL} steps={PURCHASE_STEPS} current={PURCHASE_STEP.cart} />
      </SectionBand>

      <SectionBand labelledBy="carrito-heading" tone="surface" className="gap-6 py-8 md:py-12">
        <h1 id="carrito-heading" className="text-headline-xl-mobile font-extrabold text-on-surface">
          Mi Carrito
        </h1>
        {!cart.storageAvailable && <StorageNotice />}

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div className={`${card} lg:col-span-8`}>
            {cart.isEmpty ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <EmptyCartMessage />
              </div>
            ) : (
              <CartItemList cart={cart} />
            )}
          </div>

          <aside
            aria-label="Resumen del carrito"
            className={`${card} lg:sticky lg:top-28 lg:col-span-4`}
          >
            <CartSummary cart={cart} />
          </aside>
        </div>
      </SectionBand>
    </div>
  );
}
