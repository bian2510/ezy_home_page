import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Se llama con el error capturado — para loguearlo o mandarlo a un servicio. */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Contiene una excepción de render para que no se lleve puesta toda la app.
 * Sin esto, cualquier error deja la pantalla en blanco: el visitante que llegó
 * de Instagram ve una página rota y se va (DOMAIN.md › Risk Posture, el riesgo
 * de confianza es el más alto).
 *
 * Tiene que ser una clase: React no expone `componentDidCatch` en hooks.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  private readonly handleRetry = () => {
    this.setState({ hasError: false });
  };

  override render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <section
        role="alert"
        className="mx-auto flex w-full max-w-content flex-col items-center gap-4 px-4 py-16 text-center"
      >
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Algo salió mal</h1>
        <p className="max-w-prose text-muted-foreground">
          No pudimos mostrar esta sección. Podés reintentar o seguir viendo el catálogo — tu carrito
          sigue guardado.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={this.handleRetry}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Reintentar
          </button>
          <Link
            to="/catalogo"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-6 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Ver catálogo
          </Link>
        </div>
      </section>
    );
  }
}
