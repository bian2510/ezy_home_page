import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import Icon from '@/components/ui/Icon';

describe('Icon', () => {
  it('should be 20 px by default', () => {
    const { container } = render(<Icon name="check" />);

    expect(container.querySelector('svg')).toHaveClass('h-5', 'w-5');
  });

  it('should use the size it is given instead of the default', () => {
    // `cn` no resuelve conflictos: con `h-5` y `h-10` juntos ganaba `h-5` por el
    // orden del CSS, y el ícono grande de la confirmación salía chico.
    const { container } = render(<Icon name="check" className="h-10 w-10" />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveClass('h-10', 'w-10');
    expect(svg).not.toHaveClass('h-5');
    expect(svg).not.toHaveClass('w-5');
  });
});
