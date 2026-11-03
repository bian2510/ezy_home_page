// Bajada de cada categoría en las tarjetas del Home. Describe lo que hoy hay
// en `products.json` para esa categoría, sin especificaciones que los
// productos no tengan. Al sumar una categoría nueva, sumar su texto acá:
// `tests/data/categoryDescriptions.test.ts` avisa si falta.
export const CATEGORY_DESCRIPTIONS: Readonly<Record<string, string>> = {
  Confort:
    'Motores para persianas y cortinas, controles remotos IR universales, enchufes con temporizador y más.',
  'Iluminación Inteligente':
    'Lámparas GU10 y E27, plafones y tiras LED neón de color regulable, por Wi-Fi o Zigbee.',
  Seguridad:
    'Sensores de puertas, ventanas y movimiento, cerraduras con huella y detectores de humo.',
  'Protección y Alertas': 'Detectores de gas Wi-Fi y Zigbee con alarma sonora de 70 dB.',
  Hubs: 'El gateway que conecta tus dispositivos Zigbee a la app y al Wi-Fi de tu casa.',
};
