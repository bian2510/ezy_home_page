// Cuenta de páginas, pura y ciega al dominio: recibe números, no productos.

/** Lo que muestra una página: su número, cuántas hay y el tramo a cortar. */
export interface PageSlice {
  /** Página que se muestra, siempre entre 1 y `totalPages`. */
  page: number;
  totalPages: number;
  /** Índice del primer elemento de la página (incluido). */
  start: number;
  /** Índice del final de la página (excluido), listo para `slice`. */
  end: number;
}

/** Elemento de la barra de páginas: un número o un salto ("…"). */
export type PageItem = number | 'gap';

/** Con hasta esta cantidad de páginas se muestran todas, sin saltos. */
const MAX_WITHOUT_GAPS = 7;

/**
 * Número de página de la URL (`?page=`). Cualquier cosa que no sea un entero
 * positivo escrito tal cual ("abc", "0", "2.5", "1e3") vale 1.
 */
export const parsePage = (raw: string | null): number => {
  if (raw === null || !/^\d+$/.test(raw)) return 1;
  const page = Number(raw);
  return page >= 1 ? page : 1;
};

/**
 * Tramo de una página. Una página fuera de rango se lleva a la válida más
 * cercana: nunca se muestra una página vacía mientras haya elementos.
 */
export const paginate = (total: number, requested: number, perPage: number): PageSlice => {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(requested, 1), totalPages);
  const start = (page - 1) * perPage;
  return { page, totalPages, start, end: Math.min(start + perPage, total) };
};

/**
 * Páginas a mostrar en la barra. Con pocas, todas; con muchas, la primera, la
 * última y las vecinas de la actual, con un salto entre medio. Un salto que
 * ocultaría una sola página se reemplaza por esa página.
 */
export const pageItems = (page: number, totalPages: number): PageItem[] => {
  if (totalPages <= MAX_WITHOUT_GAPS) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const shown = new Set([1, totalPages, page - 1, page, page + 1]);
  const pages = [...shown].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);

  const items: PageItem[] = [];
  pages.forEach((n, index) => {
    const previous = pages[index - 1];
    if (previous !== undefined && n - previous === 2) items.push(previous + 1);
    else if (previous !== undefined && n - previous > 2) items.push('gap');
    items.push(n);
  });
  return items;
};
