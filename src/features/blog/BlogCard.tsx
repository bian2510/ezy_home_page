import { useNavigate } from 'react-router-dom';
import type { BlogMeta } from '@/types';
import { cn } from '@/lib/cn';

/**
 * BlogCard — single article tile shown in the blog list.
 *
 * Behaviour (PRD F001, Task 010):
 *  - When `article.image` is not null, renders an `<img>` with
 *    `loading="lazy"`. When it is null, the `<img>` is omitted entirely so
 *    we do not produce a broken icon or trigger a layout shift; a
 *    fixed-aspect placeholder reserves the same vertical space the image
 *    would have occupied, so cards line up regardless of cover presence.
 *  - The card body (image slot + title + date) is a real `<button>` that
 *    navigates to `/blog/:slug` via `useNavigate`. Using a button (rather
 *    than wrapping in `<Link>`) keeps the markup consistent with
 *    ProductCard and avoids nesting interactive elements when future
 *    actions are added.
 *  - The date is formatted via `Intl.DateTimeFormat('es-AR', { year, month,
 *    day })` to satisfy the es-AR locale requirement (e.g.
 *    "1 de mayo de 2026"). The raw ISO date is preserved in
 *    `<time dateTime>` for machine readability.
 */
interface BlogCardProps {
  article: BlogMeta;
}

const dateFormatter = new Intl.DateTimeFormat('es-AR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const formatBlogDate = (isoDate: string): string =>
  dateFormatter.format(new Date(isoDate));

export default function BlogCard({ article }: BlogCardProps) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/blog/${article.slug}`);
  };

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg border border-border bg-card text-foreground',
        'transition hover:shadow-md',
      )}
    >
      <button
        type="button"
        onClick={handleNavigate}
        aria-label={`Leer artículo: ${article.title}`}
        className={cn(
          'flex flex-1 cursor-pointer flex-col text-left',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        )}
      >
        <div className="relative aspect-[16/9] w-full bg-muted">
          {article.image !== null && (
            <img
              src={article.image}
              alt={article.title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-3">
          <h3 className="text-sm font-medium text-foreground">
            {article.title}
          </h3>
          <time
            dateTime={article.date}
            className="text-xs text-muted-foreground"
          >
            {formatBlogDate(article.date)}
          </time>
        </div>
      </button>
    </article>
  );
}
