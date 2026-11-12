// BlogPostPage — `/blog/:slug`, calcado del mock "Artículo" (Stitch,
// 2026-11-12): ruta de navegación con "Volver al Blog", etiqueta, tiempo de
// lectura y fecha, el título, la bajada, la portada y, al costado, el índice
// "En este artículo" armado con los `##` del Markdown.
//
// Reglas de negocio (DOMAIN.md › Product Core › Artículo de blog y
// docs/adrs/F001-003-blog-static-markdown.md):
// - Solo el dueño publica; los visitantes solo leen.
// - Contenido en archivos `.md` estáticos (sin CMS en v1).
// - URL propia por artículo; un slug desconocido es un 404 con link al blog.
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Container from '@/components/ui/Container';
import Icon from '@/components/ui/Icon';
import type { BlogMeta } from '@/types';
import { truncateForMeta } from '@/lib/seo';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import BlogMarkdown from './BlogMarkdown';
import BlogToc from './BlogToc';
import { blogImageSrcSet, extractHeadings, formatBlogDate, readingMinutes } from './blogUtils';
import { useBlogPost } from './useBlogPost';

const backLinkClass =
  'inline-flex min-h-11 items-center gap-2 rounded-full bg-primary/10 px-4 text-label-md font-bold text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { content, meta, notFound, loading } = useBlogPost(slug ?? '');

  useDocumentMeta({
    title: meta?.title ?? 'Blog',
    description: truncateForMeta(
      meta?.excerpt ?? 'Artículo del blog de EzyHome sobre domótica y hogar inteligente.',
    ),
    path: `/blog/${slug ?? ''}`,
    ...(notFound ? { noIndex: true } : {}),
  });

  if (notFound) {
    return <BlogPostNotFound />;
  }

  if (loading || content === null || meta === null) {
    return <BlogPostLoading />;
  }

  return <BlogPostArticle meta={meta} content={content} />;
}

function BlogPostNotFound() {
  return (
    <Container className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-headline-xl font-extrabold text-on-surface">404</h1>
      <p className="text-body-lg text-on-surface-variant">
        El artículo que buscás no existe o ya no está disponible.
      </p>
      <Link to="/blog" className={backLinkClass}>
        <Icon name="arrowLeft" className="h-4 w-4" />
        Volver al blog
      </Link>
    </Container>
  );
}

function BlogPostLoading() {
  return (
    <Container className="py-16">
      <p role="status" aria-live="polite" className="text-center text-on-surface-variant">
        Cargando…
      </p>
    </Container>
  );
}

interface BlogPostArticleProps {
  meta: BlogMeta;
  content: string;
}

function BlogPostArticle({ meta, content }: BlogPostArticleProps) {
  const headings = useMemo(() => extractHeadings(content), [content]);
  const minutes = useMemo(() => readingMinutes(content), [content]);

  return (
    <Container className="flex flex-col gap-8 pb-16 pt-2 md:pb-24">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Breadcrumb items={[{ label: 'Blog', to: '/blog' }, { label: meta.title }]} />
        <Link to="/blog" className={backLinkClass}>
          <Icon name="arrowLeft" className="h-4 w-4" />
          Volver al Blog
        </Link>
      </div>

      <header className="flex max-w-4xl flex-col gap-4">
        <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-label-md text-on-surface-variant">
          {meta.category !== undefined && (
            <span className="rounded-md bg-primary px-3 py-1 text-label-sm font-bold uppercase tracking-wider text-on-primary">
              {meta.category}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Icon name="clock" className="h-4 w-4" />
            {minutes} min de lectura
          </span>
          <time dateTime={meta.date}>{formatBlogDate(meta.date)}</time>
        </p>
        <h1 className="text-headline-xl-mobile font-extrabold tracking-tight text-on-surface md:text-headline-xl lg:text-5xl lg:leading-tight">
          {meta.title}
        </h1>
        {meta.excerpt !== undefined && (
          <p className="text-body-lg text-on-surface-variant">{meta.excerpt}</p>
        )}
      </header>

      {meta.image !== null && (
        <img
          src={meta.image}
          srcSet={blogImageSrcSet(meta.image)}
          sizes="(min-width: 1280px) 1184px, 100vw"
          alt=""
          loading="eager"
          decoding="async"
          className="aspect-video w-full rounded-2xl bg-surface-container object-cover shadow-md md:aspect-[21/9]"
        />
      )}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <article className="max-w-prose lg:col-span-8 lg:max-w-none">
          <BlogMarkdown content={content} />
        </article>
        {headings.length > 0 && (
          <div className="order-first lg:order-none lg:col-span-4">
            <BlogToc headings={headings} />
          </div>
        )}
      </div>
    </Container>
  );
}
