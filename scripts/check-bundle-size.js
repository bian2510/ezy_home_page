// Presupuesto de peso del critical path.
//
// Mide lo que el visitante descarga ANTES de ver la primera pantalla: los
// assets que `dist/index.html` referencia (entry JS, CSS y los modulepreload).
// El resto de los chunks se bajan al navegar y no cuentan.
//
// DOMAIN.md pide LCP < 2.5s en 4G y el tráfico llega de Instagram en celular.
// El bundle había crecido a 127 kB gzip sin que nadie lo notara, porque no
// había nada que lo mirara: esto es ese algo.
//
// Uso: pnpm build && pnpm check:bundle
import { gzipSync } from 'node:zlib';
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

/** Tope del critical path comprimido, en kB. Medido: 95.5 kB. */
const BUDGET_KB = 105;

const DIST = resolve(process.cwd(), 'dist');
const INDEX = join(DIST, 'index.html');

const kb = (bytes) => bytes / 1024;
const fmt = (bytes) => `${kb(bytes).toFixed(2)} kB`;

/** Assets que bloquean la primera pantalla, según el HTML que sirve el server. */
const criticalAssets = (html) => {
  const patterns = [
    /<script[^>]+src="([^"]+\.js)"/g,
    /<link[^>]+rel="stylesheet"[^>]+href="([^"]+\.css)"/g,
    /<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g,
  ];

  const found = new Set();
  for (const pattern of patterns) {
    for (const [, href] of html.matchAll(pattern)) {
      found.add(href.replace(/^\//, ''));
    }
  }
  return [...found];
};

if (!existsSync(INDEX)) {
  console.error('No existe dist/index.html. Corré `pnpm build` primero.');
  process.exit(1);
}

const assets = criticalAssets(readFileSync(INDEX, 'utf8'));

if (assets.length === 0) {
  console.error('No se encontró ningún asset en dist/index.html — ¿cambió el formato del build?');
  process.exit(1);
}

let total = 0;
const rows = assets.map((asset) => {
  const path = join(DIST, asset);
  if (!existsSync(path)) {
    console.error(`dist/index.html referencia ${asset}, que no existe en dist/.`);
    process.exit(1);
  }
  const raw = readFileSync(path);
  const gzipped = gzipSync(raw).length;
  total += gzipped;
  return { asset, raw: raw.length, gzipped };
});

console.log('Critical path (lo que se descarga antes de la primera pantalla):\n');
for (const { asset, raw, gzipped } of rows.sort((a, b) => b.gzipped - a.gzipped)) {
  console.log(`  ${fmt(gzipped).padStart(10)} gzip  ${fmt(raw).padStart(10)}  ${asset}`);
}

const budget = BUDGET_KB * 1024;
const pct = ((total / budget) * 100).toFixed(0);
console.log(`\n  Total: ${fmt(total)} gzip · presupuesto ${BUDGET_KB} kB · ${pct}% usado`);

if (total > budget) {
  console.error(
    `\nEl critical path supera el presupuesto por ${fmt(total - budget)}.\n` +
      'Opciones, en orden: mover el import pesado detrás de un `lazy()` en App.tsx,\n' +
      'reemplazar la dependencia por una más liviana, o —si el peso está justificado—\n' +
      'subir BUDGET_KB en scripts/check-bundle-size.js explicando por qué en el commit.',
  );
  process.exit(1);
}

console.log('\nDentro del presupuesto.');
