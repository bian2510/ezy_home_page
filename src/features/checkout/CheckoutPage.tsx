// CheckoutPage — compra con retiro en el local (plan de la etapa 3 del ERP,
// PR 3d y 3e). El comprador deja sus datos y elige transferencia o, con
// `VITE_MERCADOPAGO_ENABLED=true`, Mercado Pago; el ERP crea el pedido con sus
// precios (el sitio no manda precios) y la página del pedido muestra a qué
// cuenta transferir o abre Mercado Pago. Los envíos siguen por WhatsApp.
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/features/cart';
import { usePricing } from '@/features/pricing';
import { isMercadoPagoEnabled } from '@/lib/env';
import { PURCHASE_STEP, PURCHASE_STEPS, PURCHASE_STEPS_LABEL } from '@/data/purchaseSteps';
import Icon from '@/components/ui/Icon';
import SectionBand from '@/components/ui/SectionBand';
import Stepper from '@/components/ui/Stepper';
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
  withoutField,
  type BuyerErrors,
  type BuyerField,
  type BuyerForm,
} from './checkoutUtils';
import BuyerFields from './BuyerFields';
import CheckoutBlocked from './CheckoutBlocked';
import CheckoutSection from './CheckoutSection';
import DeliveryOptions from './DeliveryOptions';
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
    <div className="flex flex-col">
      <SectionBand tone="low" className="py-6">
        <Stepper
          label={PURCHASE_STEPS_LABEL}
          steps={PURCHASE_STEPS}
          current={PURCHASE_STEP.checkout}
        />
      </SectionBand>

      <SectionBand labelledBy="checkout-heading" tone="surface" className="gap-6 py-8 md:py-12">
        <h1
          id="checkout-heading"
          className="text-headline-xl-mobile font-extrabold text-on-surface"
        >
          Finalizar compra
        </h1>

        {blocker !== null ? (
          <CheckoutBlocked message={blocker} />
        ) : (
          // En el celular el resumen va abajo, como el mock: el total de cada medio
          // ya se ve en "Medio de pago", junto al botón.
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            <form
              noValidate
              onSubmit={(event) => void handleSubmit(event)}
              className="flex flex-col gap-6 lg:col-span-8"
            >
              <CheckoutSection id="contacto-heading" step={1} title="Información de contacto">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <BuyerFields
                    form={form}
                    mercadoPagoEnabled={mercadoPagoEnabled}
                    errors={errors}
                    onChange={handleChange}
                  />
                </div>
              </CheckoutSection>

              <CheckoutSection id="entrega-heading" step={2} title="Entrega">
                <DeliveryOptions />
              </CheckoutSection>

              <CheckoutSection id="pago-heading" step={3} title="Medio de pago">
                <PaymentMethodField
                  mercadoPagoEnabled={mercadoPagoEnabled}
                  value={chosenMethod}
                  totals={totals}
                  onChange={setChosenMethod}
                />

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
                  className="mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-label-lg font-bold text-on-primary shadow-md transition-all hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Icon name="lock" className="h-5 w-5" />
                  {state.status === 'submitting' ? 'Enviando…' : SUBMIT_LABEL[paymentMethod]}
                </button>
              </CheckoutSection>
            </form>

            <CheckoutSummary
              items={items}
              pricingOf={pricingOf}
              total={totals[paymentMethod]}
              paymentMethod={paymentMethod}
            />
          </div>
        )}
      </SectionBand>
    </div>
  );
}

const SUBMIT_LABEL: Record<PaymentMethod, string> = {
  transfer: 'Confirmar pedido',
  mercado_pago: 'Confirmar y pagar con Mercado Pago',
};
