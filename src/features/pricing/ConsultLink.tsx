// ConsultLink — reemplaza a "Agregar al carrito" cuando el producto no tiene
// precio del ERP o no tiene stock: abre WhatsApp con la consulta armada.
import type { MouseEvent } from 'react';
import type { Product } from '@/types';
import { getWhatsAppNumber } from '@/lib/env';
import { cn } from '@/lib/cn';
import { pixelLine, pixelParams, trackPixel } from '@/lib/metaPixel';
import { buildConsultUrl } from './pricingUtils';

interface ConsultLinkProps {
  product: Product;
  className?: string;
  /** Texto del link; corto en la barra fija del celular. */
  label?: string;
}

export default function ConsultLink({
  product,
  className,
  label = 'Consultar por WhatsApp',
}: ConsultLinkProps) {
  // Dentro de la card el link no tiene que disparar la navegación al detalle.
  // Para Meta es un contacto, sin valor: el producto no tiene precio o stock.
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
    trackPixel('Contact', pixelParams([pixelLine(product, 1, null)]));
  };

  return (
    <a
      href={buildConsultUrl(product, getWhatsAppNumber())}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn(
        'inline-flex min-h-11 items-center justify-center rounded-md border border-primary',
        'bg-card px-3 py-2 text-sm font-medium text-primary',
        'transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className,
      )}
    >
      {label}
    </a>
  );
}
