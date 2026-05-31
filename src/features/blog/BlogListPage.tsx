import blogIndex from '@/data/blog/index.json';
import type { BlogMeta } from '@/types';
import BlogCard from '@/features/blog/BlogCard';

const articles = blogIndex as BlogMeta[];

/**
 * Blog list page (route `/blog`). Reads the static blog index from
 * `src/data/blog/index.json` and renders one `BlogCard` per article.
 *
 * Mobile-first grid (DOMAIN.md › Design Implications): 1 column at 360px,
 * 2 at `sm`, 3 at `md`. Articles are rendered in the order they appear in
 * `index.json` — date-based sorting is out of scope for Task 010.
 */
export default function BlogListPage() {
  return (
    <section className="mx-auto w-full max-w-content px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold text-foreground sm:text-3xl">Blog</h1>

      {articles.length === 0 ? (
        <p className="text-muted-foreground" role="status">
          No hay artículos publicados todavía
        </p>
      ) : (
        <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 md:grid-cols-3">
          {articles.map((article) => (
            <li key={article.slug}>
              <BlogCard article={article} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
