import { Outlet, useLocation } from 'react-router-dom';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import ScrollToTop from '@/components/layout/ScrollToTop';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { CartProvider, CartDrawer } from '@/features/cart';
import { ToastProvider } from '@/features/toast';
import { PricingProvider } from '@/features/pricing';

/**
 * Layout común de todas las rutas: header, `<main>` y footer.
 *
 * El `<main>` va de borde a borde en todas las páginas: cada página arma sus
 * franjas con su propio `Container` (o `SectionBand`) y las de contenido
 * arrancan con `PageHeader`, así la ruta de navegación y el título quedan en el
 * mismo lugar en todas. Ver frontend-conventions §6.
 */
export default function RootLayout() {
  const location = useLocation();
  // El boundary envuelve solo el contenido: si una página revienta, el header,
  // el carrito y el footer siguen en pie. La `key` por ruta lo remonta al
  // navegar, así el error no queda pegado.
  const page = (
    <ErrorBoundary key={location.pathname}>
      <Outlet />
    </ErrorBoundary>
  );

  return (
    <ToastProvider>
      {/* Precio y stock del ERP: afuera del carrito, que lo usa para sus totales. */}
      <PricingProvider>
        <CartProvider>
          <ScrollToTop />
          <div className="flex min-h-dvh flex-col">
            <SiteHeader />
            <main className="w-full flex-1">{page}</main>
            <SiteFooter />
          </div>
          <CartDrawer />
        </CartProvider>
      </PricingProvider>
    </ToastProvider>
  );
}
