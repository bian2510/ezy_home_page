// Actualiza `src/data/products.json` desde un export de precios de Mercado
// Libre. La lógica vive en `scripts/lib/precios.ts`; acá solo hay E/S y salida
// por consola.
//
//   node scripts/actualizar-precios.ts <export.csv>            → informe, no escribe
//   node scripts/actualizar-precios.ts <export.csv> --aplicar  → escribe el JSON
//
// El informe siempre sale primero: los precios de la web son plata, y conviene
// mirar la lista de cambios antes de publicarla.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  agruparPublicaciones,
  parsearCsv,
  precioEfectivo,
  vincular,
  type ProductoCatalogo,
} from './lib/precios.ts';

const PRODUCTOS = resolve(process.cwd(), 'src/data/products.json');

// Las banderas pueden venir antes o después del archivo: `pnpm precios:aplicar`
// antepone `--aplicar` y el CSV llega detrás.
const argumentos = process.argv.slice(2);
const aplicar = argumentos.includes('--aplicar');
const rutaCsv = argumentos.find((argumento) => !argumento.startsWith('--'));

if (rutaCsv === undefined) {
  console.error('Falta el CSV.\n  node scripts/actualizar-precios.ts <export.csv> [--aplicar]');
  process.exit(1);
}

const pesos = (valor: number) => `$ ${valor.toLocaleString('es-AR')}`;

const filas = parsearCsv(readFileSync(resolve(rutaCsv), 'utf8'));
const grupos = agruparPublicaciones(filas);
const productos = JSON.parse(readFileSync(PRODUCTOS, 'utf8')) as ProductoCatalogo[];
const { actualizaciones, nuevos, sinTocar } = vincular(grupos, productos);

console.log(`\nExport: ${filas.length} publicaciones → ${grupos.length} productos distintos`);
console.log(`Catálogo: ${productos.length} productos\n`);

const cambios = actualizaciones
  .map((actualizacion) => ({
    ...actualizacion,
    antes: precioEfectivo(actualizacion.producto),
    despues: precioEfectivo(actualizacion.resultado),
  }))
  .filter(
    ({ antes, despues, producto, resultado }) =>
      antes !== despues || producto.active !== resultado.active,
  )
  .sort((a, b) => Math.abs(b.despues / b.antes - 1) - Math.abs(a.despues / a.antes - 1));

console.log(`── Cambios de precio (${cambios.length}) ──`);
for (const { producto, antes, despues, resultado } of cambios) {
  const variacion = ((despues / antes - 1) * 100).toFixed(0);
  const signo = Number(variacion) > 0 ? '+' : '';
  const visibilidad =
    producto.active === resultado.active
      ? ''
      : resultado.active
        ? '  (se publica)'
        : '  (se oculta)';
  console.log(
    `  ${producto.id.padEnd(16)} ${producto.name.slice(0, 38).padEnd(38)} ` +
      `${pesos(antes).padStart(12)} → ${pesos(despues).padStart(12)}  ${signo}${variacion}%${visibilidad}`,
  );
}

const ocultados = actualizaciones.filter(({ resultado }) => !resultado.active);
console.log(`\n── Sin stock, quedan ocultos (${ocultados.length}) ──`);
for (const { producto } of ocultados)
  console.log(`  ${producto.id}  ${producto.name.slice(0, 50)}`);

console.log(`\n── Productos nuevos en el export (${nuevos.length}) ──`);
for (const grupo of nuevos) {
  console.log(`  ${grupo.representante.id.padEnd(16)} ${grupo.representante.titulo.slice(0, 55)}`);
}
if (nuevos.length > 0) {
  console.log('  → no se crean acá: les falta categoría, descripción e imágenes.');
}

console.log(`\n── El export no los menciona, quedan intactos (${sinTocar.length}) ──`);
for (const producto of sinTocar) console.log(`  ${producto.id}  ${producto.name.slice(0, 50)}`);

if (!aplicar) {
  console.log('\nInforme solamente. Para escribir el catálogo, repetir con --aplicar.\n');
  process.exit(0);
}

const porId = new Map(actualizaciones.map(({ producto, resultado }) => [producto.id, resultado]));
const actualizado = productos.map((producto) => porId.get(producto.id) ?? producto);

writeFileSync(PRODUCTOS, `${JSON.stringify(actualizado, null, 2)}\n`, 'utf8');
console.log(`\nEscrito ${PRODUCTOS} — ${actualizaciones.length} productos actualizados.`);
console.log('Verificar con: pnpm validate:products\n');
