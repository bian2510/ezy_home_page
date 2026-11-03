// La franja solo afirma lo que la tienda hace hoy (ver TrustStrip.tsx).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TrustStrip from '@/features/catalog/TrustStrip';

describe('TrustStrip', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should offer both payment methods when Mercado Pago is enabled', () => {
    vi.stubEnv('VITE_MERCADOPAGO_ENABLED', 'true');
    render(<TrustStrip />);

    expect(screen.getByText('Transferencia o Mercado Pago')).toBeInTheDocument();
  });

  it('should only promise transfer, with what the order page really shows, without Mercado Pago', () => {
    vi.stubEnv('VITE_MERCADOPAGO_ENABLED', '');
    render(<TrustStrip />);

    expect(screen.getByText('Pago por transferencia')).toBeInTheDocument();
    expect(screen.getByText('Al confirmar ves a qué cuenta transferir')).toBeInTheDocument();
    expect(screen.queryByText(/mercado pago/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/mejor precio/i)).not.toBeInTheDocument();
  });

  it('should mention pickup at the store and WhatsApp advice', () => {
    render(<TrustStrip />);

    expect(screen.getByText('Retiro en el local')).toBeInTheDocument();
    expect(screen.getByText('Asesoramiento por WhatsApp')).toBeInTheDocument();
  });
});
