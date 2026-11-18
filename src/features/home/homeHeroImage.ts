// Foto de fondo del hero del Home: un living de noche con vista a la ciudad
// (del dueño, exportada de Stitch). Se sirve desde `public/images/hero/` en
// WebP a tres anchos; la más grande pesa 63 kB.
//
// El mismo `srcSet` se precarga en `index.html`, solo en `/`: un test
// verifica que no se separen.
export interface HeroImage {
  src: string;
  /** Variantes por ancho, para el `srcset`. */
  srcSet: string;
}

export const HOME_HERO_IMAGE: HeroImage = {
  src: '/images/hero/inicio-1376.webp',
  srcSet:
    '/images/hero/inicio-640.webp 640w, /images/hero/inicio-1024.webp 1024w, /images/hero/inicio-1376.webp 1376w',
};
