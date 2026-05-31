import { cn } from '@/lib/cn';
import type { Toast as ToastItem, ToastType } from '@/features/toast/ToastContext';

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const typeStyles: Record<ToastType, string> = {
  success: 'bg-success text-white',
  error: 'bg-destructive text-white',
  info: 'bg-primary text-white',
};

const typeIcons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'i',
};

export default function Toast({ toast, onDismiss }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'flex min-w-64 max-w-sm items-center justify-between gap-3 rounded-lg px-4 py-3 shadow-lg',
        'motion-safe:animate-slide-in-up',
        typeStyles[toast.type],
      )}
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold"
        >
          {typeIcons[toast.type]}
        </span>
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
      <button
        aria-label="Cerrar notificación"
        onClick={() => onDismiss(toast.id)}
        className="ml-2 shrink-0 rounded p-0.5 opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M1.293 1.293a1 1 0 011.414 0L7 5.586l4.293-4.293a1 1 0 111.414 1.414L8.414 7l4.293 4.293a1 1 0 01-1.414 1.414L7 8.414l-4.293 4.293a1 1 0 01-1.414-1.414L5.586 7 1.293 2.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}

interface ToastListProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastList({ toasts, onDismiss }: ToastListProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notificaciones"
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 sm:bottom-6 sm:right-6"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
