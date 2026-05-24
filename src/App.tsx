// Top-level router for the EzyHome storefront SPA.
//
// All pages mount under `RootLayout`, which provides the persistent header/
// footer chrome and the global `CartProvider`. Routes mirror the IA in
// `.etc_sdlc/features/active/F001-ezyhome-storefront-page/design.md` (§1.
// Architecture Overview › Routing):
//   /                  → HomePage           (landing — hero + secciones)
//   /catalogo          → CatalogPage        (grilla + filtro por categoría)
//   /productos/:id     → ProductDetailPage  (galería + agregar al carrito)
//   /carrito           → CartPage           (carrito + checkout WhatsApp)
//   /blog              → BlogListPage       (listado de artículos)
//   /blog/:slug        → BlogPostPage       (artículo individual)
//   *                  → NotFoundPage       (404 — catch-all)
import { Routes, Route } from 'react-router-dom';
import RootLayout from '@/layouts/RootLayout';
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CartPage from '@/features/cart/CartPage';
import CatalogPage from '@/features/catalog/CatalogPage';
import BlogListPage from '@/features/blog/BlogListPage';
import BlogPostPage from '@/features/blog/BlogPostPage';

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/productos/:id" element={<ProductDetailPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
