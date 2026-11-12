// BlogMarkdown — el cuerpo del artículo con los estilos del mock "Artículo"
// (Stitch, 2026-11-12): secciones con la barra de color, cita como recuadro
// destacado, tablas comparativas y listas.
//
// Seguridad: sin `rehype-raw`. El HTML crudo dentro de un `.md` no se
// interpreta, solo el Markdown (ADR F001-003).
//
// Los `##` llevan el mismo `id` que arma `extractHeadings`, para que el índice
// "En este artículo" salte a cada sección. Un `#` del cuerpo se baja a `h2`: el
// único `h1` de la página es el título del artículo.
import type { ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { slugifyHeading } from './blogUtils';

interface BlogMarkdownProps {
  content: string;
}

/** Texto plano de los hijos de un título, para armar su `id`. */
const textOf = (node: ReactNode): string => {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (node !== null && typeof node === 'object' && 'props' in node) {
    return textOf((node.props as { children?: ReactNode }).children);
  }
  return '';
};

const sectionHeadingClass =
  'mt-10 scroll-mt-24 border-l-4 border-primary pl-3 text-headline-md font-bold text-on-surface first:mt-0';

const components: Components = {
  h1: ({ children }) => <h2 className={sectionHeadingClass}>{children}</h2>,
  h2: ({ children }) => (
    <h2 id={slugifyHeading(textOf(children))} className={sectionHeadingClass}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 text-headline-sm font-bold text-on-surface">{children}</h3>
  ),
  p: ({ children }) => <p className="text-body-lg text-on-surface-variant">{children}</p>,
  strong: ({ children }) => <strong className="font-bold text-on-surface">{children}</strong>,
  a: ({ children, href }) => (
    <a
      href={href}
      className="font-semibold text-primary underline underline-offset-4 hover:text-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="flex list-disc flex-col gap-2 pl-6 text-body-lg text-on-surface-variant marker:text-primary">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="flex list-decimal flex-col gap-2 pl-6 text-body-lg text-on-surface-variant marker:text-primary">
      {children}
    </ol>
  ),
  blockquote: ({ children }) => (
    <aside className="flex flex-col gap-2 rounded-xl border-l-4 border-primary bg-surface-container-low p-5 sm:p-6">
      {children}
    </aside>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto rounded-xl bg-surface-container-lowest shadow-sm">
      <table className="w-full min-w-[36rem] border-collapse text-left text-body-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-surface-container-low">{children}</thead>,
  th: ({ children }) => (
    <th scope="col" className="px-4 py-3 text-label-md font-bold text-on-surface">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-t border-outline-variant/40 px-4 py-3 align-top text-on-surface-variant">
      {children}
    </td>
  ),
};

export default function BlogMarkdown({ content }: BlogMarkdownProps) {
  return (
    <div className="flex flex-col gap-5">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
