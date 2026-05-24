// useCart — thin consumer hook over CartContext.
import { useContext } from 'react';
import { CartContext, type CartContextValue } from './CartContext';

/**
 * Subscribe to the global cart state. Throws if rendered outside a
 * `<CartProvider>` so callers fail loudly rather than silently degrading.
 */
export const useCart = (): CartContextValue => {
  const value = useContext(CartContext);
  if (value === null) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return value;
};
