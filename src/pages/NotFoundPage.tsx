import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="space-y-4 py-10 text-center">
      <h1 className="text-3xl font-semibold">404</h1>
      <p className="text-text-muted">La pagina que buscas no existe.</p>
      <Link to="/" className="text-brand-700 underline">
        Volver al inicio
      </Link>
    </section>
  );
}
