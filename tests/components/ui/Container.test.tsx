import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Container from '@/components/ui/Container';

describe('Container', () => {
  it('should cap the content at the page width and keep the side gutters outside it, as the mock', () => {
    render(
      <Container className="extra">
        <p>Contenido</p>
      </Container>,
    );

    const content = screen.getByText('Contenido').parentElement!;
    expect(content).toHaveClass('max-w-content', 'extra');
    expect(content).not.toHaveClass('md:px-margin');
    expect(content.parentElement).toHaveClass('px-gutter-mobile', 'sm:px-gutter', 'md:px-margin');
  });
});
