// CheckoutPage — compra por transferencia con retiro en el local (plan de la
// etapa 3 del ERP, PR 3d). El comprador deja sus datos, el ERP crea el pedido
// con sus precios (el sitio no manda precios) y la página del pedido muestra a
// qué cuenta transferir. Los envíos siguen por WhatsApp desde el carrito.
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/features/cart';
import { usePricing } from '@/features/pricing';
import { formatPrice } from '@/lib/formatPrice';
import { getWhatsAppNumber } from '@/lib/env';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { cn } from '@/lib/cn';
import {
  EMPTY_BUYER_FORM,
  checkoutBlocker,
  describeOrderError,
  fieldErrorsFromApi,
  stockAdjustments,
  transferTotal,
  validateBuyerForm,
  type BuyerErrors,
  type BuyerField,
  type BuyerForm,
} from './checkoutUtils';
import { OrderApiError } from './ordersApi';
import { useCreateOrder } from './useCreateOrder';

const INPUT_CLASS =
  'min-h-11 w-full rounded-md border border-border bg-card px-3 py-2 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

interface TextFieldProps {
  field: Exclude<BuyerField, 'acceptedPrivacy'>;
  label: string;
  type?: string;
  autoComplete: string;
  value: string;
  error: string | undefined;
  onChange: (field: BuyerField, value: string) => void;
}

function TextField({
  field,
  label,
  type = 'text',
  autoComplete,
  value,
  error,
  onChange,
}: TextFieldProps) {
  const id = `checkout-${field}`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        aria-invalid={error !== undefined}
        aria-describedby={error === undefined ? undefined : `${id}-error`}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(field, event.target.value)}
        className={cn(INPUT_CLASS, error !== undefined && 'border-destructive')}
      />
      {error !== undefined && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  useDocumentMeta({
    title: 'Finalizar compra',
    description: 'Comprá con transferencia y retirá en el local.',
    path: '/checkout',
    noIndex: true,
  });

  const navigate = useNavigate();
  const { items, clearCart, updateQuantity, removeItem } = useCart();
  const { pricingOf } = usePricing();
  const { state, submit } = useCreateOrder();
  const [form, setForm] = useState<BuyerForm>(EMPTY_BUYER_FORM);
  const [errors, setErrors] = useState<BuyerErrors>({});

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

    const result = await submit({
      buyer: {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        document: form.document.trim(),
      },
      items: items.map((item) => ({ sku: item.product.sku, quantity: item.quantity })),
      acceptedPrivacy: form.acceptedPrivacy,
    });
    if ('order' in result) {
      clearCart();
      void navigate(`/pedido/${result.order.token}`);
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
            <TextField
              field="name"
              label="Nombre y apellido"
              autoComplete="name"
              value={form.name}
              error={errors.name}
              onChange={handleChange}
            />
            <TextField
              field="phone"
              label="WhatsApp"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              error={errors.phone}
              onChange={handleChange}
            />
            <TextField
              field="email"
              label="Email"
              type="email"
              autoComplete="email"
              value={form.email}
              error={errors.email}
              onChange={handleChange}
            />
            <TextField
              field="document"
              label="DNI"
              autoComplete="off"
              value={form.document}
              error={errors.document}
              onChange={handleChange}
            />

            <div className="flex flex-col gap-1 rounded-md border border-border bg-muted/40 p-3">
              <label className="flex items-start gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={form.acceptedPrivacy}
                  onChange={(event) => handleChange('acceptedPrivacy', event.target.checked)}
                  className="mt-1 h-4 w-4"
                />
                <span>Acepto que EzyHome use mis datos para gestionar este pedido.</span>
              </label>
              <p className="text-xs text-muted-foreground">
                Usamos tu nombre, WhatsApp, email y DNI solo para este pedido: para avisarte de su
                estado, hacer la factura si la pedís y saber quién retira. Podés pedir verlos,
                corregirlos o borrarlos escribiéndonos por WhatsApp (Ley 25.326 de Protección de
                Datos Personales). La Agencia de Acceso a la Información Pública es el órgano de
                control.
              </p>
              {errors.acceptedPrivacy !== undefined && (
                <p className="text-sm text-destructive">{errors.acceptedPrivacy}</p>
              )}
            </div>

            {failure !== null && (
              <div
                role="alert"
                className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-foreground"
              >
                <p>{describeOrderError(failure)}</p>
                {adjustments.length > 0 && (
                  <>
                    <ul className="mt-2 list-disc pl-5">
                      {adjustments.map(({ productId, name, available }) => (
                        <li key={productId}>
                          {available > 0
                            ? `${name}: hay ${available} disponible${available === 1 ? '' : 's'}`
                            : `${name}: sin stock`}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={applyAdjustments}
                      className="mt-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Ajustar el carrito
                    </button>
                  </>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={state.status === 'submitting'}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {state.status === 'submitting' ? 'Enviando…' : 'Confirmar pedido'}
            </button>
          </form>

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
              Total:{' '}
              <span className="font-mono">{formatPrice(transferTotal(items, pricingOf))}</span>
            </p>
            <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">Pago:</strong> transferencia bancaria. Después
                de confirmar te mostramos a qué cuenta transferir.
              </li>
              <li>
                <strong className="text-foreground">Entrega:</strong> retiro en el local. Para
                envíos, escribinos por WhatsApp desde el carrito.
              </li>
            </ul>
          </aside>
        </div>
      )}
    </section>
  );
}

const withoutField = (errors: BuyerErrors, field: BuyerField): BuyerErrors =>
  Object.fromEntries(Object.entries(errors).filter(([key]) => key !== field));
