import { cn } from '@/lib/cn';
import { pageItems } from '@/lib/pagination';
import Icon from './Icon';

/**
 * Barra de páginas genérica: no sabe qué se pagina. Con una sola página no se
 * dibuja. Clases del mock del catálogo, con una diferencia: los botones miden
 * 44 px (`h-11 w-11`) y no 40, por la regla de tap targets mínimos.
 */
interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const buttonBase =
  'inline-flex h-11 w-11 items-center justify-center rounded-lg text-label-md transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background';
const idle = 'bg-surface-container text-on-surface hover:bg-surface-container-high';
const current = 'bg-primary font-bold text-on-primary shadow-sm';
const disabled =
  'disabled:cursor-not-allowed disabled:text-outline-variant disabled:hover:bg-surface-container';

export default function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const goTo = (target: number) => {
    if (target !== page && target >= 1 && target <= totalPages) onPageChange(target);
  };

  return (
    <nav aria-label="Paginación" className={cn('flex justify-center', className)}>
      <ul className="flex items-center gap-1.5">
        <li>
          <button
            type="button"
            aria-label="Página anterior"
            disabled={page <= 1}
            onClick={() => goTo(page - 1)}
            className={cn(buttonBase, idle, disabled)}
          >
            <Icon name="chevronLeft" />
          </button>
        </li>
        {pageItems(page, totalPages).map((item, index) =>
          item === 'gap' ? (
            <li key={`gap-${index}`} aria-hidden="true" className="px-1 text-on-surface-variant">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                aria-label={`Página ${item}`}
                aria-current={item === page ? 'page' : undefined}
                onClick={() => goTo(item)}
                className={cn(buttonBase, item === page ? current : cn(idle, 'font-semibold'))}
              >
                {item}
              </button>
            </li>
          ),
        )}
        <li>
          <button
            type="button"
            aria-label="Página siguiente"
            disabled={page >= totalPages}
            onClick={() => goTo(page + 1)}
            className={cn(buttonBase, idle, disabled)}
          >
            <Icon name="chevronRight" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
