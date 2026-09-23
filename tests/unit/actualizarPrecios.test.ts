// Lógica pura de la actualización masiva de precios desde el export de
// Mercado Libre. El CSV se edita a mano en una planilla, así que las rarezas
// (celdas con `-`, miles con coma, publicaciones duplicadas) son la norma y no
// la excepción.
import { describe, expect, it } from 'vitest';
import {
  agruparPublicaciones,
  calcularPrecios,
  normalizarTitulo,
  parsearCsv,
  parsearNumero,
  redondearPeso,
  vincular,
  type FilaMercadoLibre,
  type ProductoCatalogo,
} from '../../scripts/lib/precios.ts';

const buildFila = (overrides: Partial<FilaMercadoLibre> = {}): FilaMercadoLibre => ({
  id: 'MLA1',
  titulo: 'Sensor Zigbee',
  precioLista: 10000,
  precioPromo: 9000,
  precioPagina: 8100,
  stock: 5,
  ...overrides,
});

const buildProducto = (overrides: Partial<ProductoCatalogo> = {}): ProductoCatalogo => ({
  id: 'MLA1',
  name: 'Sensor Zigbee para puertas',
  description: 'Descripción cuidada',
  price: 12000,
  images: ['/img.webp'],
  category: 'Seguridad',
  isBestseller: false,
  isOnSale: false,
  active: true,
  ...overrides,
});

describe('parsearNumero', () => {
  it('should read a plain number', () => {
    expect(parsearNumero('105000')).toBe(105000);
  });

  it('should read a number with thousands separators', () => {
    expect(parsearNumero('89,775.00')).toBe(89775);
  });

  it('should treat a dash as missing', () => {
    expect(parsearNumero('-')).toBeNull();
  });

  it('should treat an empty cell as missing', () => {
    expect(parsearNumero('')).toBeNull();
    expect(parsearNumero('   ')).toBeNull();
  });

  it('should treat unparseable text as missing instead of NaN', () => {
    expect(parsearNumero('s/d')).toBeNull();
  });
});

describe('redondearPeso', () => {
  it('should round half up', () => {
    expect(redondearPeso(33610.5)).toBe(33611);
  });

  it('should round down below half', () => {
    expect(redondearPeso(45140.87)).toBe(45141);
    expect(redondearPeso(20250.4)).toBe(20250);
  });

  it('should leave whole pesos untouched', () => {
    expect(redondearPeso(89775)).toBe(89775);
  });
});

describe('normalizarTitulo', () => {
  it('should ignore case, accents and punctuation', () => {
    expect(normalizarTitulo('Tira Neón Led RGBIC 3m, IP68')).toBe(
      normalizarTitulo('tira neon led rgbic 3m ip68'),
    );
  });

  it('should keep genuinely different products apart', () => {
    expect(normalizarTitulo('Tira Neón Led 3m')).not.toBe(normalizarTitulo('Tira Neón Led 5m'));
  });
});

describe('parsearCsv', () => {
  const csv = [
    'FAMILY_ID,ITEM_ID,PRODUCT_NUMBER,VARIATION_ID,TITLE,VARIATIONS,STOCK_FLEX,PRICE,SALE_PRICE,VALUE_ADDED_TAX',
    'Publicaciones,,,,,,Información de stock,Información del producto,,',
    'Agrupador,Número de publicación,Número de producto,Número de variante,Título,Variantes,En mi depósito,Precio,Precio en promoción,PRECIO PAGINA',
    ',,,,,,,,,',
    '123,MLA2200632476,U33,,Plafon Led 24w,Blanco,51,105000,99750,"89,775.00"',
    '456,MLA2349563230,U44,,Motor Persianas,Blanco,10,175900,-,"158,310.00"',
  ].join('\n');

  it('should skip the header rows and read only publications', () => {
    const filas = parsearCsv(csv);

    expect(filas).toHaveLength(2);
    expect(filas.map((f) => f.id)).toEqual(['MLA2200632476', 'MLA2349563230']);
  });

  it('should read prices, including the pre-computed page price', () => {
    const [primera] = parsearCsv(csv);

    expect(primera?.precioLista).toBe(105000);
    expect(primera?.precioPromo).toBe(99750);
    expect(primera?.precioPagina).toBe(89775);
    expect(primera?.stock).toBe(51);
  });

  it('should read a publication without a promotional price', () => {
    const segunda = parsearCsv(csv)[1];

    expect(segunda?.precioPromo).toBeNull();
    expect(segunda?.precioPagina).toBe(158310);
  });
});

describe('agruparPublicaciones', () => {
  it('should group duplicated listings by normalised title', () => {
    const grupos = agruparPublicaciones([
      buildFila({ id: 'MLA1', titulo: 'Find My Tag Android', stock: 3 }),
      buildFila({ id: 'MLA2', titulo: 'Find My Tag Android Blanco', stock: 7 }),
      buildFila({ id: 'MLA3', titulo: 'Sensor de Gas WiFi', stock: 1 }),
    ]);

    expect(grupos).toHaveLength(3);
  });

  it('should collapse listings whose titles match after normalising', () => {
    const grupos = agruparPublicaciones([
      buildFila({ id: 'MLA1', titulo: 'Sensor de Gas WiFi', stock: 3 }),
      buildFila({ id: 'MLA2', titulo: 'SENSOR DE GAS WIFI', stock: 7 }),
    ]);

    expect(grupos).toHaveLength(1);
  });

  it('should pick the listing with the most stock as representative', () => {
    const [grupo] = agruparPublicaciones([
      buildFila({ id: 'MLA-poco', titulo: 'Sensor de Gas', stock: 3 }),
      buildFila({ id: 'MLA-mucho', titulo: 'Sensor de Gas', stock: 40 }),
    ]);

    expect(grupo?.representante.id).toBe('MLA-mucho');
  });

  it('should add up the stock of every listing in the group', () => {
    const [grupo] = agruparPublicaciones([
      buildFila({ id: 'MLA1', titulo: 'Sensor de Gas', stock: 3 }),
      buildFila({ id: 'MLA2', titulo: 'Sensor de Gas', stock: 40 }),
    ]);

    expect(grupo?.stockTotal).toBe(43);
  });
});

describe('calcularPrecios', () => {
  it('should treat the ML list price as the struck-through price when there is a promotion', () => {
    const precios = calcularPrecios(
      buildFila({ precioLista: 105000, precioPromo: 99750, precioPagina: 89775 }),
    );

    expect(precios).toEqual({ price: 105000, promotionalPrice: 89775, isOnSale: true });
  });

  it('should use the page price as the only price when there is no promotion', () => {
    const precios = calcularPrecios(
      buildFila({ precioLista: 175900, precioPromo: null, precioPagina: 158310 }),
    );

    expect(precios).toEqual({ price: 158310, isOnSale: false });
  });

  it('should round both prices to whole pesos', () => {
    const precios = calcularPrecios(
      buildFila({ precioLista: 79734.4, precioPromo: 50156.52, precioPagina: 45140.87 }),
    );

    expect(precios.price).toBe(79734);
    expect(precios.promotionalPrice).toBe(45141);
  });

  it('should never leave a promotional price at or above the list price', () => {
    const precios = calcularPrecios(
      buildFila({ precioLista: 10000, precioPromo: 10000, precioPagina: 9000 }),
    );

    expect(precios.promotionalPrice).toBeLessThan(precios.price);
  });
});

describe('vincular', () => {
  const grupos = (filas: FilaMercadoLibre[]) => agruparPublicaciones(filas);

  it('should match a group to a product by id', () => {
    const { actualizaciones, nuevos } = vincular(
      grupos([buildFila({ id: 'MLA1', titulo: 'Sensor Zigbee' })]),
      [buildProducto({ id: 'MLA1' })],
    );

    expect(actualizaciones).toHaveLength(1);
    expect(nuevos).toHaveLength(0);
  });

  it('should match a group to a product by title when the id differs', () => {
    // Los 6 productos con id MLAU de la web son los mismos que 6 del CSV con
    // id MLA: sin este fallback se crearían duplicados.
    const { actualizaciones, nuevos } = vincular(
      grupos([buildFila({ id: 'MLA3540807396', titulo: 'Find My Tag Android' })]),
      [buildProducto({ id: 'MLAU4092298728', name: 'Find My Tag Android' })],
    );

    expect(actualizaciones[0]?.producto.id).toBe('MLAU4092298728');
    expect(nuevos).toHaveLength(0);
  });

  it('should keep the existing id when matching by title', () => {
    const { actualizaciones } = vincular(
      grupos([buildFila({ id: 'MLA-nuevo', titulo: 'Find My Tag' })]),
      [buildProducto({ id: 'MLAU-viejo', name: 'Find My Tag' })],
    );

    expect(actualizaciones[0]?.resultado.id).toBe('MLAU-viejo');
  });

  it('should report a group with no counterpart as new', () => {
    const { actualizaciones, nuevos } = vincular(
      grupos([buildFila({ id: 'MLA-desconocido', titulo: 'Robot limpia vidrios' })]),
      [buildProducto({ id: 'MLA1', name: 'Sensor Zigbee' })],
    );

    expect(actualizaciones).toHaveLength(0);
    expect(nuevos.map((g) => g.representante.id)).toEqual(['MLA-desconocido']);
  });

  it('should report products the CSV never mentions, untouched', () => {
    const { sinTocar } = vincular(grupos([buildFila({ id: 'MLA1', titulo: 'Sensor Zigbee' })]), [
      buildProducto({ id: 'MLA1', name: 'Sensor Zigbee' }),
      buildProducto({ id: 'MLA-huerfano', name: 'Producto que ML no lista' }),
    ]);

    expect(sinTocar.map((p) => p.id)).toEqual(['MLA-huerfano']);
  });

  it('should hide a product whose group has no stock left', () => {
    const { actualizaciones } = vincular(
      grupos([buildFila({ id: 'MLA1', titulo: 'Sensor Zigbee', stock: 0 })]),
      [buildProducto({ id: 'MLA1', active: true })],
    );

    expect(actualizaciones[0]?.resultado.active).toBe(false);
  });

  it('should bring a product back when the group has stock again', () => {
    const { actualizaciones } = vincular(
      grupos([buildFila({ id: 'MLA1', titulo: 'Sensor Zigbee', stock: 12 })]),
      [buildProducto({ id: 'MLA1', active: false })],
    );

    expect(actualizaciones[0]?.resultado.active).toBe(true);
  });

  it('should never overwrite the editorial fields of a product', () => {
    // Los títulos y descripciones de la web están mejor redactados que los de
    // ML, y las imágenes y la categoría no existen en el CSV.
    const producto = buildProducto({
      id: 'MLA1',
      name: 'Plafón LED Inteligente 24W RGB con WiFi',
      description: 'Texto propio de EzyHome',
      images: ['/products/MLA1/01.webp'],
      category: 'Iluminación Inteligente',
      isBestseller: true,
      promotionBadge: '2x1',
    });

    const { actualizaciones } = vincular(
      grupos([buildFila({ id: 'MLA1', titulo: 'Plafon Led 24w Wifi Alexa Tuya' })]),
      [producto],
    );
    const resultado = actualizaciones[0]?.resultado;

    expect(resultado?.name).toBe('Plafón LED Inteligente 24W RGB con WiFi');
    expect(resultado?.description).toBe('Texto propio de EzyHome');
    expect(resultado?.images).toEqual(['/products/MLA1/01.webp']);
    expect(resultado?.category).toBe('Iluminación Inteligente');
    expect(resultado?.isBestseller).toBe(true);
    expect(resultado?.promotionBadge).toBe('2x1');
  });

  it('should drop a stale promotional price when the product is no longer on sale', () => {
    const { actualizaciones } = vincular(
      grupos([
        buildFila({ id: 'MLA1', precioLista: 50000, precioPromo: null, precioPagina: 45000 }),
      ]),
      [buildProducto({ id: 'MLA1', isOnSale: true, promotionalPrice: 30000 })],
    );
    const resultado = actualizaciones[0]?.resultado;

    expect(resultado?.isOnSale).toBe(false);
    expect(resultado?.promotionalPrice).toBeUndefined();
    expect(resultado?.price).toBe(45000);
  });
});
