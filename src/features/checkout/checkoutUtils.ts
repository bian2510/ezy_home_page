// Reglas puras del checkout con retiro (transferencia o Mercado Pago). Sin React ni red:
// los datos del carrito y del ERP llegan por parámetro.
import type { CartItem, Product, ProductPricing } from '@/types';
import { OrderApiError, type StockIssue } from './ordersApi';

type PricingOf = (product: Product) => ProductPricing;

/** Lo que carga el comprador en el formulario. */
export interface BuyerForm {
  name: string;
  /** WhatsApp: código de área + número, 10 dígitos sin 0 ni 15 (usuario, 2026-10-30). */
  phone: string;
  email: string;
  /** DNI, obligatorio: para facturar y saber quién retira (usuario, 2026-10-29). */
  document: string;
  acceptedPrivacy: boolean;
}

export type BuyerField = keyof BuyerForm;
export type BuyerErrors = Partial<Record<BuyerField, string>>;

export const EMPTY_BUYER_FORM: BuyerForm = {
  name: '',
  phone: '',
  email: '',
  document: '',
  acceptedPrivacy: false,
};

const digits = (value: string): string => value.replace(/\D/g, '');

/** El WhatsApp solo con dígitos: se limpia al escribir y al mandar al ERP. */
export const phoneDigits = digits;

/** Ayuda y error del WhatsApp: el mismo texto guía antes y después de equivocarse. */
export const PHONE_HINT = 'Ingresá tu número con código de área, sin 0 ni 15 (10 números)';

// 10 dígitos que no empiezan con 0 (prefijo de larga distancia) ni con 15
// (prefijo de celular, ningún código de área empieza así). +54 / 549 suman dígitos.
const PHONE_PATTERN = /^(?!0|15)\d{10}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validación del navegador, igual a la del ERP (`Store.Schemas.OrderRequest`)
 * para avisar antes de mandar. El ERP vuelve a validar: manda la del ERP.
 */
export const validateBuyerForm = (form: BuyerForm): BuyerErrors => {
  const errors: BuyerErrors = {};
  const name = form.name.trim();
  const phone = digits(form.phone);
  const document = digits(form.document);

  if (name.length < 2 || name.length > 80) errors.name = 'Poné tu nombre (de 2 a 80 letras)';
  if (!PHONE_PATTERN.test(phone)) errors.phone = PHONE_HINT;
  if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Poné un email válido';
  if (document === '') {
    errors.document = 'Poné tu DNI';
  } else if (!/^\d{7,8}$/.test(document)) {
    errors.document = 'El DNI debe tener 7 u 8 números';
  }
  if (!form.acceptedPrivacy) errors.acceptedPrivacy = 'Tenés que aceptar el aviso de privacidad';
  return errors;
};

/** Total a transferir con los precios del ERP. */
export const transferTotal = (items: CartItem[], pricingOf: PricingOf): number =>
  items.reduce((sum, item) => {
    const { price, transferPrice } = pricingOf(item.product);
    return sum + (transferPrice ?? price ?? 0) * item.quantity;
  }, 0);

/** Total con Mercado Pago (precio del local + recargo) con los precios del ERP. */
export const mercadoPagoTotal = (items: CartItem[], pricingOf: PricingOf): number =>
  items.reduce((sum, item) => sum + (pricingOf(item.product).price ?? 0) * item.quantity, 0);

/**
 * Por qué no se puede comprar por transferencia todavía, o `null` si se puede.
 * Un producto sin precio o sin stock del ERP se consulta por WhatsApp.
 */
export const checkoutBlocker = (items: CartItem[], pricingOf: PricingOf): string | null => {
  if (items.length === 0) return 'Tu carrito está vacío.';
  const availabilities = items.map((item) => pricingOf(item.product).availability);
  if (availabilities.includes('loading')) return 'Estamos cargando los precios…';
  if (availabilities.some((availability) => availability !== 'available')) {
    return 'Hay productos sin precio o sin stock: consultanos por WhatsApp.';
  }
  return null;
};

const API_FIELDS: Record<string, BuyerField> = {
  buyer_name: 'name',
  buyer_phone: 'phone',
  buyer_email: 'email',
  buyer_document: 'document',
  accepted_privacy: 'acceptedPrivacy',
};

/** Errores por campo del ERP (422) en los campos del formulario. */
export const fieldErrorsFromApi = (fieldErrors: Record<string, string[]>): BuyerErrors =>
  Object.entries(fieldErrors).reduce<BuyerErrors>((errors, [apiField, messages]) => {
    const field = API_FIELDS[apiField];
    const message = messages[0];
    return field === undefined || message === undefined ? errors : { ...errors, [field]: message };
  }, {});

/** Un producto del carrito con menos stock del pedido (409 del ERP). */
export interface StockAdjustment {
  productId: string;
  name: string;
  available: number;
}

const normalizeSku = (sku: string): string => sku.trim().toLowerCase();

/** Qué productos del carrito hay que ajustar y a cuántas unidades. */
export const stockAdjustments = (issues: StockIssue[], items: CartItem[]): StockAdjustment[] =>
  issues.flatMap((issue) => {
    const item = items.find(
      (candidate) => normalizeSku(candidate.product.sku) === normalizeSku(issue.sku),
    );
    return item === undefined
      ? []
      : [{ productId: item.product.id, name: item.product.name, available: issue.available }];
  });

/** Mensaje general para un pedido que no se pudo crear. */
export const describeOrderError = (error: unknown): string => {
  if (!(error instanceof OrderApiError)) {
    return 'No pudimos conectarnos con la tienda. Revisá tu conexión y probá de nuevo.';
  }
  if (error.detail !== null) return error.detail;
  if (Object.keys(error.fieldErrors).length > 0) return 'Revisá los datos marcados.';
  return 'No pudimos crear el pedido. Escribinos por WhatsApp y lo armamos juntos.';
};

const DEADLINE_FORMAT = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'America/Argentina/Buenos_Aires',
});

/** Vencimiento del pedido en hora de Argentina ("31/10, 12:00"); `null` si no hay. */
export const formatDeadline = (expiresAt: string | null): string | null => {
  if (expiresAt === null) return null;
  const date = new Date(expiresAt);
  return Number.isNaN(date.getTime()) ? null : DEADLINE_FORMAT.format(date);
};
