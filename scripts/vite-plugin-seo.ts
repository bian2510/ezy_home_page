// Plugin de Vite que emite `sitemap.xml` y `robots.txt` en cada build.
//
// Va como plugin y no como script aparte por dos razones: cualquier `vite
// build` los produce (no hay forma de olvidarse el paso), y el CI corre con
// Node 20, donde un script `.ts` suelto no se ejecuta — la config de Vite sí
// se transpila.
//
// La lógica vive en `scripts/lib/sitemap.ts` y está cubierta por
// `tests/unit/sitemap.test.ts`. Acá solo hay lectura de archivos y emisión.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';
import {
  RUTAS_ESTATICAS,
  construirRobots,
  construirSitemap,
  entradasDeArticulos,
  entradasDeProductos,
  type ArticuloIndexable,
  type ProductoIndexable,
} from './lib/sitemap.ts';

const leerJson = <T>(rutaRelativa: string): T =>
  JSON.parse(readFileSync(resolve(process.cwd(), rutaRelativa), 'utf8')) as T;

export function seoPlugin(sitio: string): Plugin {
  return {
    name: 'ezyhome-seo',
    // `%SITE_URL%` en index.html: las og: tags necesitan URLs absolutas —un
    // `content` relativo no le sirve a un crawler que no sabe contra qué
    // dominio resolverlo— y el dominio solo se conoce en build time.
    transformIndexHtml(html) {
      return html.replaceAll('%SITE_URL%', sitio.replace(/\/+$/, ''));
    },
    generateBundle() {
      const productos = leerJson<ProductoIndexable[]>('src/data/products.json');
      const articulos = leerJson<ArticuloIndexable[]>('src/data/blog/index.json');

      const entradas = [
        ...RUTAS_ESTATICAS.map((ruta) => ({ ruta })),
        ...entradasDeProductos(productos),
        ...entradasDeArticulos(articulos),
      ];

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: construirSitemap(sitio, entradas),
      });
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: construirRobots(sitio),
      });
    },
  };
}
