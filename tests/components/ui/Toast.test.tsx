import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Toast, { ToastList } from '@/components/ui/Toast';
import type { Toast as ToastItem } from '@/features/toast/ToastContext';

const buildToast = (overrides: Partial<ToastItem> = {}): ToastItem => ({
  id: 'toast-1',
  message: 'Producto agregado al carrito',
  type: 'success',
  ...overrides,
});

describe('Toast', () => {
  it('renders the message', () => {
    render(<Toast toast={buildToast()} onDismiss={vi.fn()} />);
    expect(screen.getByText('Producto agregado al carrito')).toBeInTheDocument();
  });

  it('has role="status" and aria-live="polite" for screen readers', () => {
    render(<Toast toast={buildToast()} onDismiss={vi.fn()} />);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-live', 'polite');
  });

  it('calls onDismiss with the toast id when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    const toast = buildToast({ id: 'abc-123' });

    render(<Toast toast={toast} onDismiss={onDismiss} />);
    await user.click(screen.getByRole('button', { name: /cerrar notificación/i }));

    expect(onDismiss).toHaveBeenCalledOnce();
    expect(onDismiss).toHaveBeenCalledWith('abc-123');
  });

  it.each([
    ['success', 'bg-success'],
    ['error', 'bg-destructive'],
    ['info', 'bg-primary'],
  ] as const)('applies correct style for %s variant', (type, expectedClass) => {
    render(<Toast toast={buildToast({ type })} onDismiss={vi.fn()} />);
    expect(screen.getByRole('status')).toHaveClass(expectedClass);
  });
});

describe('ToastList', () => {
  it('renders nothing when toasts array is empty', () => {
    const { container } = render(<ToastList toasts={[]} onDismiss={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders all toasts', () => {
    const toasts: ToastItem[] = [
      buildToast({ id: '1', message: 'Primero' }),
      buildToast({ id: '2', message: 'Segundo' }),
    ];

    render(<ToastList toasts={toasts} onDismiss={vi.fn()} />);

    expect(screen.getByText('Primero')).toBeInTheDocument();
    expect(screen.getByText('Segundo')).toBeInTheDocument();
  });
});
