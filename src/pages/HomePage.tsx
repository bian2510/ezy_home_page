import {
  BenefitCards,
  CategoryCards,
  FeaturedProducts,
  HomeHero,
  HowItWorks,
} from '@/features/home';
import { SITE_NAME } from '@/lib/seo';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

/**
 * Portada (ruta `/`). Solo arma las secciones de `features/home`; los
 * metadatos son los de siempre (título por defecto y la misma description).
 *
 * Es una ruta de borde a borde (`FULL_BLEED_PATHS` en `RootLayout`): cada
 * sección es una franja con su fondo y su propio `Container`, como el mock.
 */
export default function HomePage() {
  useDocumentMeta({
    title: SITE_NAME,
    description:
      'Iluminación inteligente, automatización y seguridad para el hogar argentino. Simple, confiable y al alcance de todos.',
    path: '/',
  });

  return (
    <div className="flex flex-col">
      <HomeHero />
      <FeaturedProducts />
      <CategoryCards />
      <BenefitCards />
      <HowItWorks />
    </div>
  );
}
