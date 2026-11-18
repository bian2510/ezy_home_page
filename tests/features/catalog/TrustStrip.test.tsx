// La franja solo afirma lo que la tienda hace hoy (ver TrustStrip.tsx).
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import TrustStrip from '@/features/catalog/TrustStrip';

describe('TrustStrip', () => {
  it('should offer both payment methods, without promising the best price', () => {
    render(<TrustStrip />);

    expect(screen.getByText('Transferencia o Mercado Pago')).toBeInTheDocument();
    expect(screen.getByText('Elegís cómo pagar al comprar')).toBeInTheDocument();
    expect(screen.queryByText(/mejor precio/i)).not.toBeInTheDocument();
  });

  it('should mention pickup at the store and WhatsApp advice', () => {
    render(<TrustStrip />);

    expect(screen.getByText('Retiro en Caballito, CABA')).toBeInTheDocument();
    expect(screen.getByText('Asesoramiento por WhatsApp')).toBeInTheDocument();
  });
});
