// Pasos de la compra que muestra la franja de arriba del carrito, el checkout y
// la página del pedido (usuario, 2026-11-03).
export const PURCHASE_STEPS = ['Carrito', 'Datos y pago', 'Confirmación'] as const;

export const PURCHASE_STEPS_LABEL = 'Pasos de la compra';

/** Índice de cada pantalla en `PURCHASE_STEPS`. */
export const PURCHASE_STEP = { cart: 0, checkout: 1, order: 2 } as const;
