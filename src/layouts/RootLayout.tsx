import { Outlet } from 'react-router-dom';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { CartProvider } from '@/features/cart/CartProvider';

// Shell layout used by every route. Provides the persistent header/footer
// chrome and wires the global `CartProvider` so any page or descendant
// component can call `useCart()` without re-mounting state across navigation.
//
// Mounting `CartProvider` at the layout level (rather than inside each page)
// is what makes the in-header cart badge and per-route cart actions share the
// same items + localStorage-backed state — the persistence contract from
// DOMAIN.md › Operational & Regulatory Constraints (Carrito persistente).
export default function RootLayout() {
  return (
    <CartProvider>
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-content flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    </CartProvider>
  );
}
