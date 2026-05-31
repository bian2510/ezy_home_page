// CartProvider — owns cart state, persistence, and dispatch handlers.
//
// Persistence requirement (DOMAIN.md › Operational & Regulatory Constraints):
// "el carrito nunca puede perderse entre sesiones sin acción explícita del
// usuario." Items are hydrated from localStorage on first render and
// re-serialised on every change. Storage failures are surfaced via
// `storageAvailable` so the UI can warn the user.
import { useCallback, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';
import { CartContext, type CartContextValue } from './CartContext';
import type { CartItem, Product } from '@/types';

const STORAGE_KEY = 'ezyhome_cart';
const MIN_QUANTITY = 1;

type CartAction =
  | { type: 'ADD_ITEM'; product: Product; quantity: number }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' };

const addOrIncrement = (items: CartItem[], product: Product, quantity: number): CartItem[] => {
  const existingIndex = items.findIndex((item) => item.product.id === product.id);
  if (existingIndex === -1) {
    return [...items, { product, quantity }];
  }
  return items.map((item, index) =>
    index === existingIndex ? { ...item, quantity: item.quantity + quantity } : item,
  );
};

const cartReducer = (state: CartItem[], action: CartAction): CartItem[] => {
  switch (action.type) {
    case 'ADD_ITEM':
      return addOrIncrement(state, action.product, action.quantity);
    case 'REMOVE_ITEM':
      return state.filter((item) => item.product.id !== action.productId);
    case 'UPDATE_QUANTITY': {
      const clamped = Math.max(MIN_QUANTITY, action.quantity);
      return state.map((item) =>
        item.product.id === action.productId ? { ...item, quantity: clamped } : item,
      );
    }
    case 'CLEAR_CART':
      return [];
    default:
      return state;
  }
};

/**
 * Reads the persisted cart from localStorage. Any failure (missing key,
 * corrupted JSON, unavailable storage) yields an empty cart — never throws.
 */
const readPersistedItems = (): CartItem[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, dispatch] = useReducer(cartReducer, undefined, readPersistedItems);
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStorageAvailable(false);
    }
  }, [items]);

  const addItem = useCallback(
    (product: Product, quantity = 1) => dispatch({ type: 'ADD_ITEM', product, quantity }),
    [],
  );

  const removeItem = useCallback(
    (productId: string) => dispatch({ type: 'REMOVE_ITEM', productId }),
    [],
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) =>
      dispatch({ type: 'UPDATE_QUANTITY', productId, quantity }),
    [],
  );

  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items],
  );

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      total,
      itemCount,
      storageAvailable,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, total, itemCount, storageAvailable],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
