import {
  BenefitCards,
  CategoryCards,
  FeaturedProducts,
  HomeHero,
  HowItWorks,
  RoutineBanner,
} from '@/features/home';
import { SITE_NAME } from '@/lib/seo';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

/**
 * Portada (ruta `/`). Solo arma las secciones de `features/home`; los
 * metadatos son los de siempre (título por defecto y la misma description).
 */
export default function HomePage() {
  useDocumentMeta({
    title: SITE_NAME,
    description:
      'Iluminación inteligente, automatización y seguridad para el hogar argentino. Simple, confiable y al alcance de todos.',
    path: '/',
  });

  return (
    <div className="flex flex-col gap-16 sm:gap-20">
      <HomeHero />
      <FeaturedProducts />
      <CategoryCards />
      {/* Franja clara de borde a borde en el celular (docs/frontend-conventions.md §6). */}
      <div className="-mx-4 -mb-6 flex flex-col gap-16 bg-surface-container-low px-4 py-14 sm:-mx-6 sm:px-6 sm:py-16 lg:mx-0 lg:mb-0 lg:rounded-2xl lg:px-12">
        <BenefitCards />
        <HowItWorks />
        <RoutineBanner />
      </div>
    </div>
  );
}
