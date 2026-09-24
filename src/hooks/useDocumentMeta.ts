// Escribe los metadatos de la página en el `<head>`: título, description,
// canónica, `robots` y JSON-LD.
//
// Por qué un hook propio de ~60 líneas y no react-helmet: el presupuesto del
// critical path son 105 kB gzip y hoy usa 93 kB. Una librería de metadatos se
// come buena parte de esos 12 kB de margen para hacer exactamente esto.
//
// Los títulos y las descripciones se calculan en `src/lib/seo.ts`, que es puro.
// Acá solo está el efecto sobre el DOM.
import { useEffect } from 'react';
import { getSiteUrl } from '@/lib/env';
import { buildCanonical, buildTitle } from '@/lib/seo';

export interface DocumentMeta {
  /** Título de la página, sin la marca — el hook le agrega `— EzyHome`. */
  title: string;
  /** Meta description ya lista (usar `truncateForMeta` si viene de datos). */
  description: string;
  /** Ruta de la página, para la canónica. Ej: `/productos/MLA1`. */
  path: string;
  /** JSON-LD de la página. Se inyecta y se remueve al salir. */
  jsonLd?: object;
  /** `true` en páginas que no aportan a una búsqueda (carrito, 404). */
  noIndex?: boolean;
}

/** Devuelve el `<meta name="...">` del head, creándolo si no existe. */
const metaTag = (name: string): HTMLMetaElement => {
  const existente = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (existente !== null) return existente;

  const creada = document.createElement('meta');
  creada.setAttribute('name', name);
  document.head.appendChild(creada);
  return creada;
};

export function useDocumentMeta({
  title,
  description,
  path,
  jsonLd,
  noIndex = false,
}: DocumentMeta): void {
  // `jsonLd` es un objeto nuevo en cada render; la dependencia real es su
  // contenido, no su identidad.
  const jsonLdSerializado = jsonLd === undefined ? '' : JSON.stringify(jsonLd);

  useEffect(() => {
    document.title = buildTitle(title);
    metaTag('description').setAttribute('content', description);

    const canonica =
      document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]') ??
      document.head.appendChild(
        Object.assign(document.createElement('link'), { rel: 'canonical' }),
      );
    canonica.setAttribute('href', buildCanonical(getSiteUrl(), path));

    // `robots` se remueve cuando la página sí es indexable: dejarlo puesto
    // sacaría del índice a la página siguiente.
    const robotsExistente = document.head.querySelector('meta[name="robots"]');
    if (noIndex) {
      metaTag('robots').setAttribute('content', 'noindex, follow');
    } else {
      robotsExistente?.remove();
    }
  }, [title, description, path, noIndex]);

  useEffect(() => {
    if (jsonLdSerializado === '') return;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = jsonLdSerializado;
    document.head.appendChild(script);

    return () => script.remove();
  }, [jsonLdSerializado]);
}
