import { useEffect, useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';

/**
 * - `panel`: panel lateral en `sm` y arriba, hoja de abajo en el celular.
 * - `floating`: card flotante arriba a la derecha, bajo el header, en `sm` y
 *   arriba (como el carrito del mock); en el celular, panel de alto completo.
 */
export type DrawerVariant = 'panel' | 'floating';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Nombre accesible del diálogo: puede llevar un ícono o un número resaltado. */
  title: ReactNode;
  children: ReactNode;
  variant?: DrawerVariant;
}

const STYLES = {
  panel: {
    backdrop: 'bg-black/40',
    panel: cn(
      'ml-auto w-full bg-card shadow-xl sm:max-w-md',
      // Celular: hoja de abajo de todo el ancho, hasta el 90 % del alto.
      'mt-auto max-h-[90vh] rounded-t-2xl sm:mt-0 sm:h-full sm:rounded-none',
    ),
    header: 'border-border px-4 py-4 sm:px-6',
    title: 'text-base font-semibold text-foreground',
    close: 'min-h-9 min-w-9 rounded-md text-muted-foreground',
    content: 'flex-1',
  },
  floating: {
    backdrop: 'bg-inverse-surface/60',
    panel: cn(
      // Celular: panel de alto completo desde la derecha.
      'ml-auto h-full w-full bg-surface-container-lowest shadow-2xl',
      // `sm` y arriba: card bajo el header (que mide ~4.5rem), con aire abajo.
      'sm:absolute sm:right-3 sm:top-20 sm:h-auto sm:max-h-[calc(100dvh-6rem)] sm:max-w-md sm:overflow-hidden sm:rounded-2xl',
    ),
    header: 'border-outline/20 bg-surface-container-low p-4',
    title: 'text-headline-sm font-bold text-on-surface',
    close: 'min-h-11 min-w-11 rounded-full text-secondary hover:bg-surface-container-high',
    // Con alto automático, el contenido toma lo que necesita y scrollea al tope.
    content: 'flex-1 sm:flex-initial',
  },
} as const;

export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
  variant = 'panel',
}: DrawerProps) {
  const titleId = useId();
  const styles = STYLES[variant];

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll while drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className={cn('absolute inset-0 backdrop-blur-sm', styles.backdrop)}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn('relative flex flex-col', styles.panel)}
      >
        {/* Header */}
        <div
          className={cn('flex shrink-0 items-center justify-between gap-2 border-b', styles.header)}
        >
          <h2 id={titleId} className={cn('flex items-center gap-2', styles.title)}>
            {title}
          </h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className={cn(
              'inline-flex items-center justify-center transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              styles.close,
            )}
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L9 7.586l3.293-3.293a1 1 0 111.414 1.414L10.414 9l3.293 3.293a1 1 0 01-1.414 1.414L9 10.414l-3.293 3.293a1 1 0 01-1.414-1.414L7.586 9 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className={cn('min-h-0 overflow-y-auto', styles.content)}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
