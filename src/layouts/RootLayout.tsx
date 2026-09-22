import { Outlet, useLocation } from 'react-router-dom';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { CartProvider, CartDrawer } from '@/features/cart';
import { ToastProvider } from '@/features/toast';

export default function RootLayout() {
  const location = useLocation();

  return (
    <ToastProvider>
      <CartProvider>
        <div className="flex min-h-dvh flex-col">
          <SiteHeader />
          <main className="mx-auto w-full max-w-content flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {/* El boundary envuelve solo el contenido: si una página revienta,
                el header, el carrito y el footer siguen en pie. La `key` por
                ruta lo remonta al navegar, así el error no queda pegado. */}
            <ErrorBoundary key={location.pathname}>
              <Outlet />
            </ErrorBoundary>
          </main>
          <SiteFooter />
        </div>
        <CartDrawer />
      </CartProvider>
    </ToastProvider>
  );
}
