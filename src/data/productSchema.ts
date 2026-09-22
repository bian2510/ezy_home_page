// Validación de `products.json`, la fuente de verdad del catálogo.
//
// El archivo se edita a mano y `as Product[]` no valida nada en runtime: un
// producto activo sin categoría ya llegó a producción y rompió el filtro del
// catálogo. Este esquema corre en `pnpm test` (y por lo tanto en CI), no en el
// browser — `zod` es devDependency y nada de `src/` fuera de este archivo lo
// importa, así que no pesa en el bundle.
//
// Ver `docs/guides/agregar-producto.md`.
import { z } from 'zod';
import type { Product } from '@/types';

/** Una imagen es una URL http(s) o una ruta local relativa a `public/`. */
const IMAGE_PATTERN = /^(https?:\/\/|\/)/;

const nonBlank = (label: string) =>
  z
    .string()
    .min(1, `${label} no puede estar vacío`)
    .refine((value) => value.trim().length > 0, `${label} no puede ser solo espacios`);

const wholePesos = (label: string) =>
  z
    .number(`${label} debe ser un número`)
    .int(`${label} debe ser un entero en pesos, sin centavos`)
    .positive(`${label} debe ser mayor a cero`);

/**
 * Forma de un producto. `strictObject` rechaza campos desconocidos: un typo
 * como `pirce` dejaría el precio real en `undefined` sin que nada se queje.
 */
export const ProductSchema = z
  .strictObject({
    id: nonBlank('id'),
    name: nonBlank('name'),
    description: nonBlank('description'),
    price: wholePesos('price'),
    images: z
      .array(
        z
          .string()
          .regex(
            IMAGE_PATTERN,
            'cada imagen debe ser una URL http(s) o una ruta que empiece con /',
          ),
      )
      .min(1, 'el producto necesita al menos una imagen'),
    category: nonBlank('category').nullable(),
    isBestseller: z.boolean(),
    isOnSale: z.boolean(),
    active: z.boolean(),
    promotionalPrice: wholePesos('promotionalPrice').optional(),
    promotionBadge: nonBlank('promotionBadge').optional(),
  })
  .superRefine((product, ctx) => {
    const addIssue = (message: string, path: string) => {
      ctx.addIssue({ code: 'custom', message, path: [path] });
    };

    // Una oferta necesita las dos mitades: sin `promotionalPrice` la card
    // anuncia descuento y cobra el precio de lista.
    if (product.isOnSale && product.promotionalPrice === undefined) {
      addIssue('isOnSale es true pero falta promotionalPrice', 'promotionalPrice');
    }
    if (!product.isOnSale && product.promotionalPrice !== undefined) {
      addIssue('tiene promotionalPrice pero isOnSale es false', 'isOnSale');
    }
    if (product.promotionalPrice !== undefined && product.promotionalPrice >= product.price) {
      addIssue(
        `promotionalPrice (${product.promotionalPrice}) debe ser menor que price (${product.price})`,
        'promotionalPrice',
      );
    }

    // Un producto visible sin categoría genera un chip sin etiqueta en el
    // filtro del catálogo.
    if (product.active && product.category === null) {
      addIssue('un producto activo necesita categoría', 'category');
    }
  });

const normalizeCategory = (category: string): string => category.trim().toLowerCase();

/**
 * El catálogo completo. Valida producto por producto para poder nombrar al
 * culpable por `id` en cada error, y después las reglas que solo existen
 * mirando el conjunto: ids únicos y categorías sin variantes disfrazadas.
 */
export const CatalogSchema = z
  .array(z.unknown())
  .superRefine((items, ctx) => {
    const seenIds = new Map<string, number>();
    const seenCategories = new Map<string, string>();

    items.forEach((item, index) => {
      const parsed = ProductSchema.safeParse(item);
      const id = (item as { id?: unknown })?.id;
      const label = typeof id === 'string' && id.length > 0 ? id : `#${index}`;

      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          const field = issue.path.join('.');
          ctx.addIssue({
            code: 'custom',
            path: [index, ...issue.path],
            message: `producto ${label}${field === '' ? '' : ` › ${field}`}: ${issue.message}`,
          });
        }
        return;
      }

      const product = parsed.data;

      const previous = seenIds.get(product.id);
      if (previous !== undefined) {
        ctx.addIssue({
          code: 'custom',
          path: [index, 'id'],
          message: `producto ${label}: id duplicado, ya lo usa el producto #${previous}`,
        });
      } else {
        seenIds.set(product.id, index);
      }

      if (product.category !== null) {
        const key = normalizeCategory(product.category);
        const first = seenCategories.get(key);
        if (first !== undefined && first !== product.category) {
          ctx.addIssue({
            code: 'custom',
            path: [index, 'category'],
            message: `producto ${label}: la categoría "${product.category}" difiere de "${first}" solo en mayúsculas o espacios; generarían dos chips para lo mismo`,
          });
        } else if (first === undefined) {
          seenCategories.set(key, product.category);
        }
      }
    });
  })
  .transform((items) => items as Product[]);

/** Mensajes de error listos para leer en la consola, uno por línea. */
export const formatIssues = (error: z.ZodError): string =>
  error.issues.map((issue) => issue.message).join('\n');
