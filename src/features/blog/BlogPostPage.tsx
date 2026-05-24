// BlogPostPage — /blog/:slug route.
//
// Loads a single blog post by URL slug via `useBlogPost` and renders its
// title and publication date above the Markdown body. The body is rendered
// with `react-markdown` + `remark-gfm` for GitHub-flavoured Markdown
// (tables, task lists, autolinks, strikethrough).
//
// Security note: `rehype-raw` is intentionally NOT installed in the pipeline.
// Raw HTML embedded in `.md` files MUST NOT be parsed or rendered — only
// the syntactic Markdown subset is honoured. This is the project default for
// any user/author-supplied Markdown.
//
// Business rules (see DOMAIN.md › Product Core › Artículo de blog y
// docs/adrs/F001-003-blog-static-markdown.md):
// - Solo el dueño publica; los visitantes solo leen.
// - Contenido gestionado como archivos estáticos `.md` (sin CMS en v1).
// - URL propia por artículo (`/blog/:slug`).
// - Slug desconocido => 404 con link de regreso al listado del blog.
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useBlogPost } from '@/features/blog/useBlogPost';
import type { BlogMeta } from '@/types';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { content, meta, notFound, loading } = useBlogPost(slug ?? '');

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
    <section className="mx-auto w-full max-w-content space-y-4 px-4 py-12 text-center">
      <h1 className="text-3xl font-semibold text-foreground">404</h1>
      <p className="text-muted-foreground">
        El artículo que buscás no existe o ya no está disponible.
      </p>
      <Link
        to="/blog"
        className="inline-flex min-h-11 items-center justify-center text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Volver al blog
      </Link>
    </section>
  );
}

function BlogPostLoading() {
  return (
    <section className="mx-auto w-full max-w-content px-4 py-12">
      <p
        role="status"
        aria-live="polite"
        className="text-center text-muted-foreground"
      >
        Cargando…
      </p>
    </section>
  );
}

interface BlogPostArticleProps {
  meta: BlogMeta;
  content: string;
}

// `meta.date` is `YYYY-MM-DD` (ISO 8601 date only). Parsing it directly with
// `new Date(string)` would interpret it as UTC midnight and shift the day in
// negative TZ offsets (e.g. es-AR displayed yesterday in browsers running
// UTC-3 on a CI box configured to UTC). Split and build with the local-time
// constructor to keep the displayed day stable across timezones.
const formatBlogDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.split('-').map((part) => Number(part));
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

function BlogPostArticle({ meta, content }: BlogPostArticleProps) {
  return (
    <article className="mx-auto w-full max-w-prose px-4 py-6 sm:py-10">
      <header className="mb-6 space-y-2">
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
          {meta.title}
        </h1>
        <time
          dateTime={meta.date}
          className="block text-sm text-muted-foreground"
        >
          {formatBlogDate(meta.date)}
        </time>
      </header>

      <div className="prose-content space-y-4 text-base leading-relaxed text-foreground/90">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Keep document outline single-H1: the article title is the only
            // page-level H1, so author H1s within the body render as H2.
            h1: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
