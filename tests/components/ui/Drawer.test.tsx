import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Drawer from '@/components/ui/Drawer';

const renderDrawer = (isOpen: boolean, onClose = vi.fn()) =>
  render(
    <Drawer isOpen={isOpen} onClose={onClose} title="Carrito">
      <p>Contenido del drawer</p>
    </Drawer>,
  );

describe('Drawer', () => {
  it('renders nothing when isOpen is false', () => {
    renderDrawer(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the dialog with title and children when isOpen is true', () => {
    renderDrawer(true);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Carrito')).toBeInTheDocument();
    expect(screen.getByText('Contenido del drawer')).toBeInTheDocument();
  });

  it('has aria-modal="true"', () => {
    renderDrawer(true);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderDrawer(true, onClose);

    await user.click(screen.getByRole('button', { name: /cerrar/i }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when the backdrop is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Drawer isOpen={true} onClose={onClose} title="Test">
        <p>Contenido</p>
      </Drawer>,
    );

    // The backdrop is the sibling div before the panel
    const backdrop = document.querySelector('[aria-hidden="true"]')!;
    await user.click(backdrop);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when Escape key is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderDrawer(true, onClose);

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not call onClose on Escape when closed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderDrawer(false, onClose);

    await user.keyboard('{Escape}');

    expect(onClose).not.toHaveBeenCalled();
  });

  it('should name the dialog with a title that is not plain text', () => {
    render(
      <Drawer
        isOpen={true}
        onClose={vi.fn()}
        title={
          <>
            Tu carrito <span>(3)</span>
          </>
        }
      >
        <p>Contenido</p>
      </Drawer>,
    );

    expect(screen.getByRole('dialog', { name: 'Tu carrito (3)' })).toBeInTheDocument();
  });

  it('should keep the dialog, close button, Escape and backdrop in the floating variant', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Drawer isOpen={true} onClose={onClose} title="Carrito" variant="floating">
        <p>Contenido</p>
      </Drawer>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Carrito' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    await user.click(screen.getByRole('button', { name: /cerrar/i }));
    await user.keyboard('{Escape}');
    await user.click(document.querySelector('[aria-hidden="true"]')!);

    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('should lock the page scroll while open in the floating variant', () => {
    const { unmount } = render(
      <Drawer isOpen={true} onClose={vi.fn()} title="Carrito" variant="floating">
        <p>Contenido</p>
      </Drawer>,
    );

    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
