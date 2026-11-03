import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { useInView } from '@/hooks/useInView';

type Callback = (entries: { isIntersecting: boolean }[]) => void;

let lastCallback: Callback | null = null;
const disconnect = vi.fn();

class FakeObserver {
  constructor(callback: Callback) {
    lastCallback = callback;
  }
  observe = vi.fn();
  disconnect = disconnect;
}

function Probe() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  return <div ref={ref}>{inView ? 'visible' : 'fuera'}</div>;
}

describe('useInView', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    lastCallback = null;
    disconnect.mockClear();
  });

  it('should start as in view and follow the observer', () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    render(<Probe />);

    expect(screen.getByText('visible')).toBeInTheDocument();

    act(() => lastCallback?.([{ isIntersecting: false }]));
    expect(screen.getByText('fuera')).toBeInTheDocument();

    act(() => lastCallback?.([{ isIntersecting: true }]));
    expect(screen.getByText('visible')).toBeInTheDocument();
  });

  it('should stop observing on unmount', () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    const { unmount } = render(<Probe />);

    unmount();

    expect(disconnect).toHaveBeenCalled();
  });

  it('should stay in view when the browser has no IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    render(<Probe />);

    expect(screen.getByText('visible')).toBeInTheDocument();
  });
});
