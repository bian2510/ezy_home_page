// BlogCard — tarjeta de un artículo en el listado del blog, calcada del mock
// "Blog" (Stitch, 2026-11-12): portada, etiqueta, título, bajada y "Leer
// artículo".
//
// Toda la tarjeta es un `<Link>` (navegación = `<a>`, frontend-conventions §8).
// Sin portada no se dibuja un `<img>` roto: queda un recuadro del mismo alto
// para que las tarjetas se alineen.
import { Link } from 'react-router-dom';
import type { BlogMeta } from '@/types';
import Icon from '@/components/ui/Icon';
import { blogImageSrcSet, formatBlogDate } from './blogUtils';

interface BlogCardProps {
  article: BlogMeta;
}

export default function BlogCard({ article }: BlogCardProps) {
  return (
    <article className="h-full">
      <Link
        to={`/blog/${article.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div className="relative aspect-video w-full overflow-hidden bg-surface-container">
          {article.image !== null && (
            <img
              src={article.image}
              srcSet={blogImageSrcSet(article.image)}
              sizes="(min-width: 768px) 33vw, 100vw"
              alt={article.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          {article.category !== undefined && (
            <span className="absolute left-4 top-4 rounded-md bg-surface-container-lowest px-3 py-1 text-label-sm font-bold uppercase tracking-wider text-primary">
              {article.category}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-6 sm:p-8">
          <time dateTime={article.date} className="text-label-md text-on-surface-variant">
            {formatBlogDate(article.date)}
          </time>
          <h2 className="text-headline-sm font-bold text-on-surface transition-colors group-hover:text-primary">
            {article.title}
          </h2>
          {article.excerpt !== undefined && (
            <p className="line-clamp-3 text-body-md text-on-surface-variant">{article.excerpt}</p>
          )}
          <span className="mt-auto inline-flex items-center gap-2 pt-4 text-label-lg font-bold text-primary">
            Leer artículo
            <Icon
              name="arrowRight"
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
            />
          </span>
        </div>
      </Link>
    </article>
  );
}
