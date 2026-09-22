import { Outlet } from 'react-router-dom';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { CartProvider, CartDrawer } from '@/features/cart';
import { ToastProvider } from '@/features/toast';

export default function RootLayout() {
  return (
    <ToastProvider>
      <CartProvider>
        <div className="flex min-h-dvh flex-col">
          <SiteHeader />
          <main className="mx-auto w-full max-w-content flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
          <SiteFooter />
        </div>
        <CartDrawer />
      </CartProvider>
    </ToastProvider>
  );
}
