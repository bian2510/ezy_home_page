// CheckoutPage — compra con retiro en el local (plan de la etapa 3 del ERP,
// PR 3d y 3e). El comprador deja sus datos y elige transferencia o, con
// `VITE_MERCADOPAGO_ENABLED=true`, Mercado Pago; el ERP crea el pedido con sus
// precios (el sitio no manda precios) y la página del pedido muestra a qué
// cuenta transferir o abre Mercado Pago. Los envíos siguen por WhatsApp.
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/features/cart';
import { usePricing } from '@/features/pricing';
import { getWhatsAppNumber, isMercadoPagoEnabled } from '@/lib/env';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import {
  EMPTY_BUYER_FORM,
  checkoutBlocker,
  fieldErrorsFromApi,
  mercadoPagoTotal,
  phoneDigits,
  stockAdjustments,
  transferTotal,
  validateBuyerForm,
  type BuyerErrors,
  type BuyerField,
  type BuyerForm,
} from './checkoutUtils';
import BuyerFields from './BuyerFields';
import CheckoutSummary from './CheckoutSummary';
import OrderErrorAlert from './OrderErrorAlert';
import PaymentMethodField from './PaymentMethodField';
import { saveOrderDraft } from './orderDraftStorage';
import { OrderApiError, type PaymentMethod } from './ordersApi';
import { useCreateOrder, type OrderDraft } from './useCreateOrder';

export default function CheckoutPage() {
  useDocumentMeta({
    title: 'Finalizar compra',
    description: 'Comprá y retirá en el local.',
    path: '/checkout',
    noIndex: true,
  });

  const navigate = useNavigate();
  const { items, clearCart, updateQuantity, removeItem } = useCart();
  const { pricingOf } = usePricing();
  const { state, submit } = useCreateOrder();
  const [form, setForm] = useState<BuyerForm>(EMPTY_BUYER_FORM);
  const [errors, setErrors] = useState<BuyerErrors>({});
  const [chosenMethod, setChosenMethod] = useState<PaymentMethod>('transfer');
  const mercadoPagoEnabled = isMercadoPagoEnabled();
  const paymentMethod: PaymentMethod = mercadoPagoEnabled ? chosenMethod : 'transfer';
  const totals: Record<PaymentMethod, number> = {
    transfer: transferTotal(items, pricingOf),
    mercado_pago: mercadoPagoTotal(items, pricingOf),
  };

  const blocker = checkoutBlocker(items, pricingOf);
  const failure = state.status === 'failed' ? state.error : null;
  const adjustments =
    failure instanceof OrderApiError ? stockAdjustments(failure.stockIssues, items) : [];

  const handleChange = (field: BuyerField, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => withoutField(current, field));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validateBuyerForm(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const draft: OrderDraft = {
      buyer: {
        name: form.name.trim(),
        phone: phoneDigits(form.phone),
        email: form.email.trim(),
        document: form.document.trim(),
      },
      items: items.map((item) => ({ sku: item.product.sku, quantity: item.quantity })),
      acceptedPrivacy: form.acceptedPrivacy,
      paymentMethod,
    };
    const result = await submit(draft);
    if ('order' in result) {
      clearCart();
      const path = `/pedido/${result.order.token}`;
      if (paymentMethod === 'mercado_pago') {
        // Para pasar a transferencia si MP falla (el ERP no devuelve el comprador).
        saveOrderDraft(result.order.token, draft);
        void navigate(path, { state: { openMercadoPago: true } });
      } else {
        void navigate(path);
      }
    } else if (result.error instanceof OrderApiError) {
      // Los errores por campo del ERP (422) van al formulario, como los propios.
      setErrors(fieldErrorsFromApi(result.error.fieldErrors));
    }
  };

  const applyAdjustments = () => {
    adjustments.forEach(({ productId, available }) =>
      available > 0 ? updateQuantity(productId, available) : removeItem(productId),
    );
  };

  return (
    <section className="mx-auto w-full max-w-content px-4 py-8 sm:py-12">
      <h1 className="mb-6 text-2xl font-semibold text-foreground sm:text-3xl">Finalizar compra</h1>

      {blocker !== null ? (
        <div className="flex flex-col items-start gap-4">
          <p className="text-base text-muted-foreground">{blocker}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/carrito"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Volver al carrito
            </Link>
            <a
              href={`https://wa.me/${getWhatsAppNumber()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Escribinos por WhatsApp
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_20rem]">
          <form
            noValidate
            onSubmit={(event) => void handleSubmit(event)}
            className="flex flex-col gap-4"
          >
            <BuyerFields
              form={form}
              mercadoPagoEnabled={mercadoPagoEnabled}
              errors={errors}
              onChange={handleChange}
            />

            {mercadoPagoEnabled && (
              <PaymentMethodField value={chosenMethod} totals={totals} onChange={setChosenMethod} />
            )}

            {failure !== null && (
              <OrderErrorAlert
                error={failure}
                adjustments={adjustments}
                onAdjust={applyAdjustments}
              />
            )}

            <button
              type="submit"
              disabled={state.status === 'submitting'}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {state.status === 'submitting' ? 'Enviando…' : SUBMIT_LABEL[paymentMethod]}
            </button>
          </form>

          <CheckoutSummary
            items={items}
            total={totals[paymentMethod]}
            paymentMethod={paymentMethod}
          />
        </div>
      )}
    </section>
  );
}

const SUBMIT_LABEL: Record<PaymentMethod, string> = {
  transfer: 'Confirmar pedido',
  mercado_pago: 'Confirmar y pagar con Mercado Pago',
};

const withoutField = (errors: BuyerErrors, field: BuyerField): BuyerErrors =>
  Object.fromEntries(Object.entries(errors).filter(([key]) => key !== field));
