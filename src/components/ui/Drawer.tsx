import { useEffect, useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
  const titleId = useId();

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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel — right side on sm+, bottom sheet on mobile */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'relative ml-auto flex w-full flex-col bg-card shadow-xl',
          'sm:max-w-md',
          // Mobile: full-width bottom sheet capped at 90vh
          'max-h-[90vh] rounded-t-2xl sm:rounded-none',
          'mt-auto sm:mt-0 sm:h-full',
        )}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-4 sm:px-6">
          <h2 id={titleId} className="text-base font-semibold text-foreground">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
