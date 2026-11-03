import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Container from '@/components/ui/Container';

describe('Container', () => {
  it('should render its children inside the shared page container', () => {
    render(
      <Container className="extra">
        <p>Contenido</p>
      </Container>,
    );

    const content = screen.getByText('Contenido');
    expect(content.parentElement).toHaveClass('max-w-content', 'extra');
  });
});
