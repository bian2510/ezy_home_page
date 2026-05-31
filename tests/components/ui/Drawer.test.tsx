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
});
