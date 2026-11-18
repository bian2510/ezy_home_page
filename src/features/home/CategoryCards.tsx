// CategoryCards — "Soluciones para cada rincón de tu casa": una tarjeta por
// categoría real del catálogo, con su cantidad de productos y el link al
// catálogo filtrado. Ni categorías ni conteos inventados: salen de
// `products.json` (`buildCategoryCards`).
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { activeProducts } from '@/data/catalog';
import { CATEGORY_DESCRIPTIONS } from '@/data/categoryDescriptions';
import Icon, { type IconName } from '@/components/ui/Icon';
import SectionHeader from './SectionHeader';
import SectionBand from '@/components/ui/SectionBand';
import { buildCategoryCards, productCountLabel } from './homeUtils';

const HEADING_ID = 'categorias-heading';

/** Ícono por categoría; una categoría nueva usa la caja genérica. */
const CATEGORY_ICONS: Readonly<Record<string, IconName>> = {
  'Iluminación Inteligente': 'lightBulb',
  Seguridad: 'shield',
  Confort: 'sun',
  'Protección y Alertas': 'bell',
  Hubs: 'wifi',
};

export default function CategoryCards() {
  // En el render y no al cargar el módulo: el Home viaja en el bundle inicial,
  // y un catálogo roto tiene que caer en el ErrorBoundary de la página, no
  // tirar abajo toda la app.
  const cards = useMemo(() => buildCategoryCards(activeProducts, CATEGORY_DESCRIPTIONS), []);
  if (cards.length === 0) return null;

  return (
    <SectionBand labelledBy={HEADING_ID} tone="surface" className="gap-8 pb-16 md:pb-20">
      <SectionHeader id={HEADING_ID} title="Soluciones para cada rincón de tu casa">
        <p className="max-w-md text-body-md text-secondary">
          Dispositivos Wi-Fi, Zigbee y Bluetooth que se instalan sin reformas.
        </p>
      </SectionHeader>

      <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(({ category, count, href, description }) => (
          <li key={category}>
            <Link
              to={href}
              className="group flex h-full flex-col rounded-xl bg-surface-container-lowest p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container text-primary transition-transform group-hover:scale-110">
                <Icon name={CATEGORY_ICONS[category] ?? 'cube'} className="h-6 w-6" />
              </span>
              <h3 className="text-headline-sm font-bold text-on-surface transition-colors group-hover:text-primary">
                {category}
              </h3>
              {description !== undefined && (
                <p className="mt-2 text-body-sm text-secondary">{description}</p>
              )}
              <span className="mt-auto inline-flex items-center gap-1 pt-4 text-label-md font-semibold text-primary">
                {productCountLabel(count)}
                <Icon name="chevronRight" className="h-4 w-4" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </SectionBand>
  );
}
