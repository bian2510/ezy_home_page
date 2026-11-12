// BlogToc — "En este artículo": un link a cada sección (`##`) del artículo. En
// escritorio queda fijo al costado mientras se lee; en el celular va arriba
// del cuerpo.
import Icon from '@/components/ui/Icon';
import type { BlogHeading } from './blogUtils';

interface BlogTocProps {
  headings: readonly BlogHeading[];
}

const HEADING_ID = 'toc-heading';

export default function BlogToc({ headings }: BlogTocProps) {
  return (
    <nav
      aria-labelledby={HEADING_ID}
      className="flex flex-col gap-3 rounded-2xl bg-surface-container-low p-6 lg:sticky lg:top-24"
    >
      <h2
        id={HEADING_ID}
        className="flex items-center gap-2 text-label-lg font-bold text-on-surface"
      >
        <Icon name="listBullet" className="h-5 w-5 text-primary" />
        En este artículo
      </h2>
      <ul className="flex list-none flex-col p-0">
        {headings.map(({ id, text }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className="flex min-h-11 items-center gap-2 rounded text-body-sm text-on-surface-variant transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:min-h-9"
            >
              <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
