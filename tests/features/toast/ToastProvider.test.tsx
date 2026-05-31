import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import ToastProvider from '@/features/toast/ToastProvider';
import { useToast } from '@/hooks/useToast';

const wrapper = ({ children }: { children: ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('addToast renders a toast with the given message', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.addToast('Producto agregado');
    });

    expect(screen.getByText('Producto agregado')).toBeInTheDocument();
  });

  it('toast disappears automatically after 3 seconds', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.addToast('Auto-dismiss test');
    });

    expect(screen.getByText('Auto-dismiss test')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByText('Auto-dismiss test')).not.toBeInTheDocument();
  });

  it('removeToast dismisses a toast immediately', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.addToast('Manual dismiss');
    });

    const toastId = result.current.toasts[0]!.id;

    act(() => {
      result.current.removeToast(toastId);
    });

    expect(screen.queryByText('Manual dismiss')).not.toBeInTheDocument();
  });

  it('supports multiple toasts simultaneously', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.addToast('Toast uno');
      result.current.addToast('Toast dos');
    });

    expect(screen.getByText('Toast uno')).toBeInTheDocument();
    expect(screen.getByText('Toast dos')).toBeInTheDocument();
    expect(result.current.toasts).toHaveLength(2);
  });

  it('useToast throws when used outside ToastProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => renderHook(() => useToast())).toThrow(
      'useToast must be used inside ToastProvider',
    );

    consoleError.mockRestore();
  });
});

describe('ToastProvider — dismiss via UI button', () => {
  it('clicking the close button removes the toast', async () => {
    // userEvent needs real timers to avoid deadlocks — this test runs outside
    // the fake-timer beforeEach/afterEach block above.
    vi.useRealTimers();
    const user = userEvent.setup();

    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.addToast('Cerrable');
    });

    await user.click(screen.getByRole('button', { name: /cerrar notificación/i }));

    expect(screen.queryByText('Cerrable')).not.toBeInTheDocument();
  });
});
