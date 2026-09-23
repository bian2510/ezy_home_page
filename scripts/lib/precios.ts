// Lógica pura de la actualización de precios desde el export de Mercado Libre.
//
// Sin E/S ni dependencias del repo: todo lo que entra viene por parámetro, para
// poder testearlo sin tocar archivos. El CLI que la usa es
// `scripts/actualizar-precios.ts`.
//
// El CSV lo exporta Mercado Libre y se edita a mano en una planilla, así que las
// rarezas son la norma: filas de encabezado en español, celdas con `-`, miles
// con coma, y varias publicaciones para el mismo producto.

/** Una publicación de Mercado Libre, ya parseada. */
export interface FilaMercadoLibre {
  id: string;
  titulo: string;
  /** Precio de lista en ML. */
  precioLista: number | null;
  /** Precio en promoción en ML, si la publicación tiene una. */
  precioPromo: number | null;
  /** Columna `PRECIO PAGINA`: el precio para la web, 10% por debajo de ML. */
  precioPagina: number | null;
  stock: number;
}

/** Un producto tal como vive en `src/data/products.json`. */
export interface ProductoCatalogo {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string | null;
  isBestseller: boolean;
  isOnSale: boolean;
  active: boolean;
  promotionalPrice?: number;
  promotionBadge?: string;
}

/** Publicaciones que son el mismo producto, con una elegida como referencia. */
export interface GrupoMercadoLibre {
  representante: FilaMercadoLibre;
  publicaciones: FilaMercadoLibre[];
  stockTotal: number;
}

export interface PreciosCalculados {
  price: number;
  promotionalPrice?: number;
  isOnSale: boolean;
}

export interface Actualizacion {
  producto: ProductoCatalogo;
  resultado: ProductoCatalogo;
  grupo: GrupoMercadoLibre;
}

export interface Vinculacion {
  actualizaciones: Actualizacion[];
  /** Grupos del CSV sin contraparte en el catálogo. */
  nuevos: GrupoMercadoLibre[];
  /** Productos del catálogo que el CSV no menciona: quedan como están. */
  sinTocar: ProductoCatalogo[];
}

/**
 * Lee una celda de precio. Devuelve `null` —y nunca `NaN`— para las celdas
 * vacías o con `-`, que es como la planilla marca "sin dato".
 */
export const parsearNumero = (valor: string | undefined): number | null => {
  const limpio = (valor ?? '').replace(/,/g, '').trim();
  if (limpio === '' || limpio === '-' || limpio === '–') return null;
  const numero = Number(limpio);
  return Number.isFinite(numero) ? numero : null;
};

/**
 * Redondea a pesos enteros, medio hacia arriba. El catálogo no admite centavos:
 * la card los redondea al mostrar pero el carrito sumaría el valor exacto, y al
 * cliente no le cerraría la cuenta.
 */
export const redondearPeso = (valor: number): number => Math.round(valor);

/**
 * Clave para detectar que dos publicaciones son el mismo producto: sin
 * mayúsculas, acentos ni signos. Mercado Libre acumula publicaciones repetidas
 * del mismo artículo y sin esto entrarían al catálogo por duplicado.
 */
export const normalizarTitulo = (titulo: string): string =>
  (titulo ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const CAMPOS = {
  id: 'ITEM_ID',
  titulo: 'TITLE',
  stock: 'STOCK_FLEX',
  lista: 'PRICE',
  promo: 'SALE_PRICE',
  // La planilla reutiliza la columna del template de ML para el precio de la
  // web: en la fila de encabezado en español figura como `PRECIO PAGINA`.
  pagina: 'VALUE_ADDED_TAX',
} as const;

/** Parte una línea de CSV respetando las comillas (los miles vienen como "89,775.00"). */
const partirLinea = (linea: string): string[] => {
  const celdas: string[] = [];
  let actual = '';
  let entreComillas = false;

  for (const caracter of linea) {
    if (caracter === '"') {
      entreComillas = !entreComillas;
      continue;
    }
    if (caracter === ',' && !entreComillas) {
      celdas.push(actual);
      actual = '';
      continue;
    }
    actual += caracter;
  }
  celdas.push(actual);
  return celdas;
};

/**
 * Lee el export completo. Las primeras filas son encabezados del template de ML
 * (en inglés y en español); solo interesan las que traen un id de publicación.
 */
export const parsearCsv = (contenido: string): FilaMercadoLibre[] => {
  const lineas = contenido.split(/\r?\n/).filter((linea) => linea.trim() !== '');
  if (lineas.length === 0) return [];

  const cabecera = partirLinea(lineas[0] ?? '');
  const indice = (campo: string) => cabecera.indexOf(campo);
  const columnas = {
    id: indice(CAMPOS.id),
    titulo: indice(CAMPOS.titulo),
    stock: indice(CAMPOS.stock),
    lista: indice(CAMPOS.lista),
    promo: indice(CAMPOS.promo),
    pagina: indice(CAMPOS.pagina),
  };

  const faltantes = Object.entries(columnas)
    .filter(([, posicion]) => posicion === -1)
    .map(([nombre]) => nombre);
  if (faltantes.length > 0) {
    throw new Error(
      `El CSV no tiene las columnas esperadas del export de Mercado Libre: faltan ${faltantes.join(', ')}.`,
    );
  }

  return lineas
    .slice(1)
    .map(partirLinea)
    .filter((celdas) => (celdas[columnas.id] ?? '').trim().startsWith('MLA'))
    .map((celdas) => ({
      id: (celdas[columnas.id] ?? '').trim(),
      titulo: (celdas[columnas.titulo] ?? '').trim(),
      precioLista: parsearNumero(celdas[columnas.lista]),
      precioPromo: parsearNumero(celdas[columnas.promo]),
      precioPagina: parsearNumero(celdas[columnas.pagina]),
      stock: parsearNumero(celdas[columnas.stock]) ?? 0,
    }));
};

/**
 * Junta las publicaciones que son el mismo producto. Como referencia toma la de
 * más stock —la que el vendedor está usando de verdad— y a igual stock, el id
 * más alto, que es la publicación más reciente.
 */
export const agruparPublicaciones = (filas: FilaMercadoLibre[]): GrupoMercadoLibre[] => {
  const porTitulo = new Map<string, FilaMercadoLibre[]>();

  for (const fila of filas) {
    const clave = normalizarTitulo(fila.titulo);
    const grupo = porTitulo.get(clave);
    if (grupo === undefined) porTitulo.set(clave, [fila]);
    else grupo.push(fila);
  }

  // `reduce` sin valor inicial en vez de indexar: cada grupo nace con al menos
  // una publicación, y así el tipo sale sin `undefined` bajo cualquier tsconfig.
  return [...porTitulo.values()].map((publicaciones) => ({
    representante: publicaciones.reduce((mejor, fila) =>
      fila.stock > mejor.stock || (fila.stock === mejor.stock && fila.id > mejor.id) ? fila : mejor,
    ),
    publicaciones,
    stockTotal: publicaciones.reduce((suma, fila) => suma + fila.stock, 0),
  }));
};

/**
 * Traduce los precios de ML al contrato de `Product`.
 *
 * Con promoción en ML, el precio tachado que ve el cliente es el de lista real
 * de ML y el que paga es el de la web. Sin promoción hay un solo precio, el de
 * la web: marcar oferta sin descuento sería mentirle al cliente.
 */
export const calcularPrecios = (fila: FilaMercadoLibre): PreciosCalculados => {
  const pagina = fila.precioPagina ?? fila.precioPromo ?? fila.precioLista;
  if (pagina === null) {
    throw new Error(`La publicación ${fila.id} no tiene ningún precio utilizable.`);
  }

  const precioPagina = redondearPeso(pagina);
  if (fila.precioPromo === null || fila.precioLista === null) {
    return { price: precioPagina, isOnSale: false };
  }

  const lista = redondearPeso(fila.precioLista);
  // Si el precio de lista no queda por encima del de la web no hay descuento
  // que mostrar, y el validador rechaza una promoción que no descuenta nada.
  if (lista <= precioPagina) {
    return { price: precioPagina, isOnSale: false };
  }

  return { price: lista, promotionalPrice: precioPagina, isOnSale: true };
};

/** Aplica los precios y la visibilidad, dejando intacto todo lo editorial. */
const aplicarGrupo = (producto: ProductoCatalogo, grupo: GrupoMercadoLibre): ProductoCatalogo => {
  const precios = calcularPrecios(grupo.representante);
  const { promotionalPrice: _descartado, ...resto } = producto;

  return {
    ...resto,
    price: precios.price,
    isOnSale: precios.isOnSale,
    ...(precios.promotionalPrice === undefined
      ? {}
      : { promotionalPrice: precios.promotionalPrice }),
    active: grupo.stockTotal > 0,
  };
};

/**
 * Cruza el export con el catálogo. Primero por id; si ninguna publicación del
 * grupo coincide, por título normalizado — así se reconocen los productos de la
 * web con id `MLAU` que en el export figuran con otro id.
 */
export const vincular = (
  grupos: GrupoMercadoLibre[],
  productos: ProductoCatalogo[],
): Vinculacion => {
  const porId = new Map(productos.map((producto) => [producto.id, producto]));
  const porTitulo = new Map(
    productos.map((producto) => [normalizarTitulo(producto.name), producto]),
  );

  const actualizaciones: Actualizacion[] = [];
  const nuevos: GrupoMercadoLibre[] = [];
  const usados = new Set<string>();

  for (const grupo of grupos) {
    const porIdentificador = grupo.publicaciones
      .map((publicacion) => porId.get(publicacion.id))
      .find((producto) => producto !== undefined);
    const porNombre = grupo.publicaciones
      .map((publicacion) => porTitulo.get(normalizarTitulo(publicacion.titulo)))
      .find((producto) => producto !== undefined);
    const producto = porIdentificador ?? porNombre;

    if (producto === undefined || usados.has(producto.id)) {
      if (producto === undefined) nuevos.push(grupo);
      continue;
    }

    usados.add(producto.id);
    actualizaciones.push({ producto, resultado: aplicarGrupo(producto, grupo), grupo });
  }

  return {
    actualizaciones,
    nuevos,
    sinTocar: productos.filter((producto) => !usados.has(producto.id)),
  };
};

/** Precio que el cliente termina pagando, para comparar antes y después. */
export const precioEfectivo = (producto: ProductoCatalogo): number =>
  producto.isOnSale && producto.promotionalPrice !== undefined
    ? producto.promotionalPrice
    : producto.price;
