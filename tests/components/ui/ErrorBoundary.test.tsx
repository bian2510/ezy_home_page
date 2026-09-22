import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

const Boom = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) throw new Error('kaboom');
  return <p>contenido sano</p>;
};

const renderBoundary = (ui: React.ReactNode) =>
  render(
    <MemoryRouter>
      <ErrorBoundary>{ui}</ErrorBoundary>
    </MemoryRouter>,
  );

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // React loguea todo error capturado por un boundary; el ruido no aporta.
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render its children when nothing throws', () => {
    renderBoundary(<Boom shouldThrow={false} />);

    expect(screen.getByText('contenido sano')).toBeInTheDocument();
  });

  it('should render the fallback instead of crashing when a child throws', () => {
    renderBoundary(<Boom />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('contenido sano')).not.toBeInTheDocument();
  });

  it('should explain the problem in plain Spanish, without leaking the stack', () => {
    renderBoundary(<Boom />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/algo salió mal/i);
    expect(alert).not.toHaveTextContent('kaboom');
  });

  it('should offer a way back to the catalog', () => {
    renderBoundary(<Boom />);

    expect(screen.getByRole('link', { name: /ver catálogo/i })).toHaveAttribute(
      'href',
      '/catalogo',
    );
  });

  it('should recover when the user retries and the child no longer throws', async () => {
    const user = userEvent.setup();
    let shouldThrow = true;
    const Flaky = () => <Boom shouldThrow={shouldThrow} />;

    render(
      <MemoryRouter>
        <ErrorBoundary>
          <Flaky />
        </ErrorBoundary>
      </MemoryRouter>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();

    shouldThrow = false;
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    expect(screen.getByText('contenido sano')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should report the error so it is not swallowed silently', () => {
    const onError = vi.fn();

    render(
      <MemoryRouter>
        <ErrorBoundary onError={onError}>
          <Boom />
        </ErrorBoundary>
      </MemoryRouter>,
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]?.[0]).toBeInstanceOf(Error);
  });
});
