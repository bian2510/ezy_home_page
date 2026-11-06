import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import ContactCard from '@/components/ui/ContactCard';

const renderCard = () =>
  render(
    <ul>
      <ContactCard icon="mail" title="Email" action={<a href="mailto:a@b.c">Enviar</a>}>
        <span>a@b.c</span>
      </ContactCard>
    </ul>,
  );

describe('ContactCard', () => {
  it('should render a list item titled with a heading', () => {
    renderCard();

    const card = screen.getByRole('listitem');
    expect(within(card).getByRole('heading', { level: 2, name: 'Email' })).toBeInTheDocument();
  });

  it('should render the contact value and the action inside the card', () => {
    renderCard();

    const card = screen.getByRole('listitem');
    expect(within(card).getByText('a@b.c', { selector: 'span' })).toBeInTheDocument();
    expect(within(card).getByRole('link', { name: 'Enviar' })).toHaveAttribute(
      'href',
      'mailto:a@b.c',
    );
  });

  it('should hide the decorative icon from assistive tech', () => {
    const { container } = renderCard();

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
