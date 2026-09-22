// Top-level router for the EzyHome storefront SPA.
//
// All pages mount under `RootLayout`, which provides the persistent header/
// footer chrome, los providers globales y el ErrorBoundary del `<main>`.
// Routes mirror the IA in
// `.etc_sdlc/features/active/F001-ezyhome-storefront-page/design.md` (§1.
// Architecture Overview › Routing):
//   /                  → HomePage           (landing — hero + secciones)
//   /catalogo          → CatalogPage        (grilla + filtro por categoría)
//   /productos/:id     → ProductDetailPage  (galería + agregar al carrito)
//   /carrito           → CartPage           (carrito + checkout WhatsApp)
//   /blog              → BlogListPage       (listado de artículos)
//   /blog/:slug        → BlogPostPage       (artículo individual)
//   *                  → NotFoundPage       (404 — catch-all)
//
// Solo la landing y el 404 viajan en el bundle inicial: son la primera pantalla
// del visitante que llega de Instagram, y DOMAIN.md pide LCP < 2.5s en 4G. El
// resto de las rutas se descarga al navegar.
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import RootLayout from '@/layouts/RootLayout';
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';

const CatalogPage = lazy(() =>
  import('@/features/catalog').then((m) => ({ default: m.CatalogPage })),
);
const CartPage = lazy(() => import('@/features/cart').then((m) => ({ default: m.CartPage })));
const BlogListPage = lazy(() =>
  import('@/features/blog').then((m) => ({ default: m.BlogListPage })),
);
const BlogPostPage = lazy(() =>
  import('@/features/blog').then((m) => ({ default: m.BlogPostPage })),
);
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const QuienesSomosPage = lazy(() => import('@/pages/QuienesSomosPage'));
const ComoComprarPage = lazy(() => import('@/pages/ComoComprarPage'));

function RouteFallback() {
  return (
    <p role="status" aria-label="Cargando" className="py-16 text-center text-muted-foreground">
      Cargando…
    </p>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/catalogo"
          element={
            <Suspense fallback={<RouteFallback />}>
              <CatalogPage />
            </Suspense>
          }
        />
        <Route
          path="/productos/:id"
          element={
            <Suspense fallback={<RouteFallback />}>
              <ProductDetailPage />
            </Suspense>
          }
        />
        <Route
          path="/carrito"
          element={
            <Suspense fallback={<RouteFallback />}>
              <CartPage />
            </Suspense>
          }
        />
        <Route
          path="/blog"
          element={
            <Suspense fallback={<RouteFallback />}>
              <BlogListPage />
            </Suspense>
          }
        />
        <Route
          path="/blog/:slug"
          element={
            <Suspense fallback={<RouteFallback />}>
              <BlogPostPage />
            </Suspense>
          }
        />
        <Route
          path="/quienes-somos"
          element={
            <Suspense fallback={<RouteFallback />}>
              <QuienesSomosPage />
            </Suspense>
          }
        />
        <Route
          path="/como-comprar"
          element={
            <Suspense fallback={<RouteFallback />}>
              <ComoComprarPage />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
