// BlogListPage — `/blog`, calcado del mock "Blog" (Stitch, 2026-11-12): ruta
// de navegación y título (`PageHeader`) y una tarjeta por artículo de
// `src/data/blog/index.json`, en el orden del índice.
import blogIndex from '@/data/blog/index.json';
import type { BlogMeta } from '@/types';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/ui/PageHeader';
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
      <PageHeader
        id="blog-heading"
        breadcrumb={[{ label: 'Blog' }]}
        title={
          <>
            Consejos e Ideas para tu <span className="text-primary">Smart Home</span>
          </>
        }
      >
        Guías prácticas, novedades sobre domótica y consejos para ahorrar energía y ganar confort en
        cada rincón de tu hogar.
      </PageHeader>

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
