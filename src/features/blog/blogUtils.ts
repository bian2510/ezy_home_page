// Reglas puras del blog: el índice "En este artículo", el tiempo de lectura,
// la fecha y las variantes de la foto de portada. Sin React.

/** Una sección del artículo (un `##` del Markdown) para el índice. */
export interface BlogHeading {
  id: string;
  text: string;
}

/** Palabras por minuto para estimar la lectura. */
const WORDS_PER_MINUTE = 200;

/**
 * Id de ancla de un título: sin tildes, sin signos y sin el número de sección
 * ("1. ¿Qué es?" → "que-es"), así el link no cambia si se reordenan secciones.
 */
export const slugifyHeading = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/^\s*\d+\.\s*/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Texto de un título sin las marcas de énfasis de Markdown. */
const plainHeadingText = (raw: string): string => raw.replace(/[*_`]/g, '').trim();

/** Los `##` del artículo, en orden: el índice "En este artículo". */
export const extractHeadings = (markdown: string): BlogHeading[] =>
  markdown
    .split('\n')
    .filter((line) => line.startsWith('## '))
    .map((line) => {
      const text = plainHeadingText(line.slice(3));
      return { id: slugifyHeading(text), text };
    });

/** Minutos de lectura estimados, redondeados para arriba y nunca menos de 1. */
export const readingMinutes = (markdown: string): number => {
  const words = markdown.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
};

const dateFormatter = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/**
 * Fecha `YYYY-MM-DD` en es-AR ("1 de mayo de 2026"). `new Date('YYYY-MM-DD')`
 * la lee como medianoche UTC y en UTC-3 muestra el día anterior: se arma con
 * el constructor de hora local.
 */
export const formatBlogDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.split('-') as [string, string, string];
  return dateFormatter.format(new Date(Number(year), Number(month) - 1, Number(day)));
};

/** Anchos en que se exporta cada portada a `public/images/blog/`. */
const COVER_WIDTHS = [640, 1024, 1376] as const;
const COVER_PATTERN = /^(.*)-1024\.webp$/;

/**
 * `srcset` de una portada exportada como `<nombre>-<ancho>.webp`; `undefined`
 * si la imagen no tiene esas variantes.
 */
export const blogImageSrcSet = (image: string): string | undefined => {
  const base = COVER_PATTERN.exec(image)?.[1];
  if (base === undefined) return undefined;
  return COVER_WIDTHS.map((width) => `${base}-${width}.webp ${width}w`).join(', ');
};
