import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import Stepper from '@/components/ui/Stepper';

const STEPS = ['Carrito', 'Datos y pago', 'Confirmación'] as const;

describe('Stepper', () => {
  it('should mark the current step and number every step', () => {
    render(<Stepper label="Pasos de la compra" steps={STEPS} current={1} />);

    const list = screen.getByRole('list', { name: 'Pasos de la compra' });
    const items = within(list).getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual([
      expect.stringContaining('1. Carrito'),
      expect.stringContaining('2. Datos y pago'),
      expect.stringContaining('3. Confirmación'),
    ]);
    expect(items[1]).toHaveAttribute('aria-current', 'step');
    expect(items[0]).not.toHaveAttribute('aria-current');
    expect(items[2]).not.toHaveAttribute('aria-current');
  });

  it('should tell screen readers which steps are done and which are next', () => {
    render(<Stepper label="Pasos de la compra" steps={STEPS} current={1} />);

    const [done, current, next] = screen.getAllByRole('listitem');
    expect(done).toHaveTextContent(/completado/i);
    expect(current).toHaveTextContent(/paso actual/i);
    expect(next).not.toHaveTextContent(/completado|paso actual/i);
  });

  it('should mark every previous step as done on the last step', () => {
    render(<Stepper label="Pasos de la compra" steps={STEPS} current={2} />);

    const items = screen.getAllByRole('listitem');
    expect(items.filter((item) => /completado/i.test(item.textContent ?? ''))).toHaveLength(2);
    expect(items[2]).toHaveAttribute('aria-current', 'step');
  });
});
