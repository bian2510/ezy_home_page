// PurchasePanel — título, precios y compra del detalle.
//
// Mismas reglas que siempre: precio y stock del ERP, tope por stock, "Consultar
// por WhatsApp" sin stock o sin precio. Nuevo del rediseño: "Ahorrás $ X
// pagando por transferencia" (la diferencia real entre los dos precios) en vez
// de un precio tachado. Sin cuotas, envío ni variantes (usuario, 2026-11-03).
import type { RefObject } from 'react';
import type { Product } from '@/types';
import QuantitySelector from '@/components/ui/QuantitySelector';
import Icon from '@/components/ui/Icon';
import {
  ConsultLink,
  ProductPrice,
  STOCK_LIMIT_MESSAGE,
  transferSavings,
} from '@/features/pricing';
import { formatPrice } from '@/lib/formatPrice';
import type { Purchase } from './usePurchase';

interface PurchasePanelProps {
  product: Product;
  purchase: Purchase;
  /** Lo observa la barra fija del celular: aparece cuando esto sale de pantalla. */
  actionsRef: RefObject<HTMLDivElement>;
}

export default function PurchasePanel({ product, purchase, actionsRef }: PurchasePanelProps) {
  const { pricing } = purchase;
  const savings = transferSavings(pricing);

  return (
    <div className="flex flex-col gap-6 rounded-xl bg-surface-container-lowest p-6 shadow-sm md:p-8 lg:sticky lg:top-28 lg:col-span-5 lg:row-span-2">
      <h1 className="text-headline-md font-bold leading-snug tracking-tight text-on-surface md:text-headline-xl-mobile">
        {product.name}
      </h1>

      <div className="flex flex-col gap-2 rounded-xl bg-surface-container-low p-4">
        <ProductPrice pricing={pricing} size="detail" />
        {savings !== null && (
          <p className="self-start rounded bg-tertiary-container px-2 py-1 text-label-md font-bold text-on-tertiary">
            Ahorrás {formatPrice(savings)} pagando por transferencia
          </p>
        )}
      </div>

      <div ref={actionsRef} className="flex flex-col gap-3">
        {purchase.showsBuyButton ? (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <QuantitySelector
                value={purchase.quantity}
                onChange={purchase.setQuantity}
                min={1}
                max={purchase.max}
              />
              <button
                type="button"
                onClick={purchase.add}
                disabled={!purchase.canAdd}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-label-lg font-bold text-on-primary shadow-md transition-all hover:bg-primary-container hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon name="cart" />
                Agregar al carrito
              </button>
            </div>
            {purchase.atStockLimit && (
              <p role="status" className="text-body-sm text-secondary">
                {STOCK_LIMIT_MESSAGE}
              </p>
            )}
          </>
        ) : (
          <ConsultLink product={product} className="min-h-12 rounded-lg px-6" />
        )}
      </div>
    </div>
  );
}
