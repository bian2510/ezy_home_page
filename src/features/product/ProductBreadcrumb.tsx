// ProductBreadcrumb — Inicio / Productos / categoría / producto, en la franja
// clara de arriba del detalle (como el mock). Usa el `Breadcrumb` común.
import type { Product } from '@/types';
import Breadcrumb, { type BreadcrumbItem } from '@/components/ui/Breadcrumb';
import Container from '@/components/ui/Container';

interface ProductBreadcrumbProps {
  product: Product;
}

export default function ProductBreadcrumb({ product }: ProductBreadcrumbProps) {
  const category = product.category?.trim();
  const items: BreadcrumbItem[] = [
    { label: 'Productos', to: '/catalogo' },
    ...(category !== undefined && category !== ''
      ? [{ label: category, to: `/catalogo?category=${encodeURIComponent(category)}` }]
      : []),
    { label: product.name },
  ];

  return (
    <div className="w-full bg-surface-container-low">
      <Container className="py-2">
        <Breadcrumb items={items} />
      </Container>
    </div>
  );
}
