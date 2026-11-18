// Provincias del envío a domicilio con el código de una letra que espera el ERP
// (ISO 3166-2:AR, el que usan los correos: B = Buenos Aires, C = CABA). Es la
// misma lista fija de `EzyHomeApp.Shipping.Names` en el ERP (ADR-030): si cambia
// allá, cambia acá (llamadas-al-backend.md §8). Ordenadas por nombre para el
// select del checkout.

export interface ShippingProvince {
  code: string;
  name: string;
}

export const SHIPPING_PROVINCES: readonly ShippingProvince[] = [
  { code: 'B', name: 'Buenos Aires' },
  { code: 'C', name: 'CABA' },
  { code: 'K', name: 'Catamarca' },
  { code: 'H', name: 'Chaco' },
  { code: 'U', name: 'Chubut' },
  { code: 'X', name: 'Córdoba' },
  { code: 'W', name: 'Corrientes' },
  { code: 'E', name: 'Entre Ríos' },
  { code: 'P', name: 'Formosa' },
  { code: 'Y', name: 'Jujuy' },
  { code: 'L', name: 'La Pampa' },
  { code: 'F', name: 'La Rioja' },
  { code: 'M', name: 'Mendoza' },
  { code: 'N', name: 'Misiones' },
  { code: 'Q', name: 'Neuquén' },
  { code: 'R', name: 'Río Negro' },
  { code: 'A', name: 'Salta' },
  { code: 'J', name: 'San Juan' },
  { code: 'D', name: 'San Luis' },
  { code: 'Z', name: 'Santa Cruz' },
  { code: 'S', name: 'Santa Fe' },
  { code: 'G', name: 'Santiago del Estero' },
  { code: 'V', name: 'Tierra del Fuego' },
  { code: 'T', name: 'Tucumán' },
];

const CODES = new Set(SHIPPING_PROVINCES.map((province) => province.code));

export const isProvinceCode = (code: string): boolean => CODES.has(code);
