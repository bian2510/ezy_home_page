import { Outlet, useLocation } from 'react-router-dom';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import Container from '@/components/ui/Container';
import { CartProvider, CartDrawer } from '@/features/cart';
import { ToastProvider } from '@/features/toast';
import { PricingProvider } from '@/features/pricing';

/**
 * Rutas que arman sus propias franjas de borde a borde (cada una con su
 * `Container` adentro), como el Home del mock. El resto va dentro del
 * contenedor de página.
 */
const FULL_BLEED_PATHS: ReadonlySet<string> = new Set(['/']);

export default function RootLayout() {
  const location = useLocation();
  const fullBleed = FULL_BLEED_PATHS.has(location.pathname);
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
          <div className="flex min-h-dvh flex-col">
            <SiteHeader />
            <main className="w-full flex-1">
              {fullBleed ? page : <Container className="py-6">{page}</Container>}
            </main>
            <SiteFooter />
          </div>
          <CartDrawer />
        </CartProvider>
      </PricingProvider>
    </ToastProvider>
  );
}
