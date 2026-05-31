// CartContext — React context for the global cart state.
// The actual state and dispatch logic live in `CartProvider`; this module
// only owns the context object so consumers can subscribe via `useCart`.
//
// See DOMAIN.md › Product Core (Carrito) and Operational & Regulatory
// Constraints (Carrito persistente) for the business rules implemented here.
import { createContext } from 'react';
import type { CartItem, Product } from '@/types';

/**
 * Public API exposed by the cart context. UI components depend on this
 * shape; reducer internals are intentionally not part of the contract.
 */
export interface CartContextValue {
  items: CartItem[];
  /** Add a product to the cart. If already present, the quantity is incremented. */
  addItem: (product: Product, quantity?: number) => void;
  /** Remove a product from the cart by id. No-op if not present. */
  removeItem: (productId: string) => void;
  /** Set the quantity for a product. Clamped to a minimum of 1. */
  updateQuantity: (productId: string, quantity: number) => void;
  /** Empty the cart entirely. */
  clearCart: () => void;
  /** Σ (product.price × quantity) across every item. */
  total: number;
  /** Σ quantity across every item — used by the header badge. */
  itemCount: number;
  /**
   * `false` when persistence to localStorage has failed (e.g. quota exceeded
   * or storage disabled). UI may surface a warning so the user knows the
   * cart will not survive a refresh.
   */
  storageAvailable: boolean;
  /** `true` while the cart drawer is visible. */
  isCartOpen: boolean;
  /** Open the cart drawer. */
  openCart: () => void;
  /** Close the cart drawer. */
  closeCart: () => void;
}

/**
 * The context is created with `null` as the sentinel for "no provider
 * mounted". `useCart` converts that into an explicit, descriptive error so
 * the failure happens at the consumer, not deep inside React.
 */
export const CartContext = createContext<CartContextValue | null>(null);
