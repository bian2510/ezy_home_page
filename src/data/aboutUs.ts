// Textos de Quiénes somos: los perfiles de cliente y los compromisos de la
// tienda. Salen de DOMAIN.md › Domain y Core Problem.
import type { IconName } from '@/components/ui/Icon';

export interface AboutUsCard {
  icon: IconName;
  title: string;
  detail: string;
}

export const PROFILES: readonly AboutUsCard[] = [
  {
    icon: 'home',
    title: 'Querés mejorar tu hogar',
    detail:
      'Tenés ganas de modernizar tu casa pero no sabés por dónde empezar. Te asesoramos para que el primer paso sea simple y tenga impacto real desde el día uno.',
  },
  {
    icon: 'shield',
    title: 'La seguridad es prioridad',
    detail:
      'Cámaras, detectores de humo o gas, sensores de movimiento. Soluciones concretas para que tu familia esté protegida sin necesitar instalar sistemas complejos.',
  },
  {
    icon: 'lightBulb',
    title: 'Empezás con algo pequeño',
    detail:
      'Una lamparita inteligente o un enchufe automatizado ya cambian la experiencia del hogar. No hace falta renovar todo: te ayudamos a escalar a tu ritmo.',
  },
];

export const COMMITMENTS: readonly AboutUsCard[] = [
  {
    icon: 'check',
    title: 'Profesionalismo',
    detail:
      'Cada producto está seleccionado y verificado. Te acompañamos antes, durante y después de la compra.',
  },
  {
    icon: 'chat',
    title: 'Accesibilidad',
    detail:
      'Precios pensados para el mercado argentino. Sin tecnicismos: si tenés dudas, las resolvemos por WhatsApp.',
  },
  {
    icon: 'lock',
    title: 'Confianza',
    detail:
      'Cerramos cada venta de forma asistida para asegurarnos de que elegiste el producto correcto y que llegue en perfectas condiciones.',
  },
];
