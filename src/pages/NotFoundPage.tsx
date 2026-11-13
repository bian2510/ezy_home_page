import { useLocation } from 'react-router-dom';
import NotFoundState from '@/components/ui/NotFoundState';
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
    <NotFoundState
      breadcrumb={[{ label: 'Página no encontrada' }]}
      message="La página que buscás no existe."
      back={{ to: '/', label: 'Volver al inicio' }}
    />
  );
}
