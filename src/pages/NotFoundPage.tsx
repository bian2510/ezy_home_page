import { Link, useLocation } from 'react-router-dom';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

export default function NotFoundPage() {
  const { pathname } = useLocation();
  useDocumentMeta({
    title: 'Página no encontrada',
    description: 'La página que buscás no existe.',
    path: pathname,
    noIndex: true,
  });

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
