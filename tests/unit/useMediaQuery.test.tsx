import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

type Listener = (event: { matches: boolean }) => void;

// Como el `matchMedia` real: `matches` refleja el ancho actual y avisa al cambiar.
const stubMatchMedia = (initial: boolean) => {
  let current = initial;
  let listener: Listener | null = null;
  const removeEventListener = vi.fn();
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      get matches() {
        return current;
      },
      addEventListener: (_: string, fn: Listener) => {
        listener = fn;
      },
      removeEventListener,
    })),
  );
  const change = (matches: boolean) => {
    current = matches;
    listener?.({ matches });
  };
  return { change, removeEventListener };
};

function Probe() {
  return <p>{useMediaQuery('(min-width: 768px)') ? 'ancho' : 'angosto'}</p>;
}

describe('useMediaQuery', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should read the query on the first render, without a flash', () => {
    stubMatchMedia(true);
    render(<Probe />);

    expect(screen.getByText('ancho')).toBeInTheDocument();
  });

  it('should follow the changes of the query and stop listening on unmount', () => {
    const media = stubMatchMedia(false);
    const { unmount } = render(<Probe />);
    expect(screen.getByText('angosto')).toBeInTheDocument();

    act(() => media.change(true));
    expect(screen.getByText('ancho')).toBeInTheDocument();

    unmount();
    expect(media.removeEventListener).toHaveBeenCalled();
  });

  it('should be false when the browser has no matchMedia', () => {
    vi.stubGlobal('matchMedia', undefined);
    render(<Probe />);

    expect(screen.getByText('angosto')).toBeInTheDocument();
  });
});
