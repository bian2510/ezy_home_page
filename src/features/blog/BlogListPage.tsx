// BlogListPage — `/blog`, calcado del mock "Blog" (Stitch, 2026-11-12): ruta
// de navegación, el título "Consejos e Ideas para tu Smart Home" y una tarjeta
// por artículo de `src/data/blog/index.json`, en el orden del índice.
//
// Es de borde a borde (`FULL_BLEED_PATHS` en `RootLayout`): cada franja lleva
// su `Container`.
import blogIndex from '@/data/blog/index.json';
import type { BlogMeta } from '@/types';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Container from '@/components/ui/Container';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import BlogCard from './BlogCard';

const articles = blogIndex as BlogMeta[];

export default function BlogListPage() {
  useDocumentMeta({
    title: 'Blog',
    description:
      'Guías y notas sobre domótica: cómo elegir, instalar y aprovechar los dispositivos inteligentes de tu casa.',
    path: '/blog',
  });

  return (
    <>
      <section
        aria-labelledby="blog-heading"
        className="relative w-full overflow-hidden bg-surface-container-low"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
        />
        <Container className="relative flex flex-col gap-4 pb-12 pt-2 md:pb-16">
          <Breadcrumb items={[{ label: 'Blog' }]} className="mb-4 md:mb-8" />
          <h1
            id="blog-heading"
            className="text-headline-xl-mobile font-extrabold tracking-tight text-on-surface md:text-headline-xl lg:text-5xl lg:leading-tight"
          >
            Consejos e Ideas para tu <span className="text-primary">Smart Home</span>
          </h1>
          <p className="max-w-3xl text-body-lg text-on-surface-variant">
            Guías prácticas, novedades sobre domótica y consejos para ahorrar energía y ganar
            confort en cada rincón de tu hogar.
          </p>
        </Container>
      </section>

      <div className="w-full bg-surface">
        <Container className="py-10 md:py-16">
          {articles.length === 0 ? (
            <p className="text-on-surface-variant" role="status">
              No hay artículos publicados todavía
            </p>
          ) : (
            <ul className="grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
              {articles.map((article) => (
                <li key={article.slug}>
                  <BlogCard article={article} />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </div>
    </>
  );
}
