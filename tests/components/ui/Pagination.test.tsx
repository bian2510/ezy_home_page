import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from '@/components/ui/Pagination';

const renderPagination = (page: number, totalPages: number) => {
  const onPageChange = vi.fn();
  render(<Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />);
  return onPageChange;
};

describe('Pagination', () => {
  it('should be a navigation landmark named "Paginación"', () => {
    renderPagination(1, 3);

    expect(screen.getByRole('navigation', { name: 'Paginación' })).toBeInTheDocument();
  });

  it('should mark the current page with aria-current', () => {
    renderPagination(2, 3);

    const nav = screen.getByRole('navigation', { name: 'Paginación' });
    expect(within(nav).getByRole('button', { name: 'Página 2' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(nav).getByRole('button', { name: 'Página 1' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('should go to the chosen page', async () => {
    const user = userEvent.setup();
    const onPageChange = renderPagination(1, 3);

    await user.click(screen.getByRole('button', { name: 'Página 3' }));

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('should move with the previous and next buttons', async () => {
    const user = userEvent.setup();
    const onPageChange = renderPagination(2, 3);

    await user.click(screen.getByRole('button', { name: 'Página anterior' }));
    await user.click(screen.getByRole('button', { name: 'Página siguiente' }));

    expect(onPageChange.mock.calls).toEqual([[1], [3]]);
  });

  it('should disable "previous" on the first page and "next" on the last one', () => {
    renderPagination(1, 1 + 2);
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Página siguiente' })).toBeEnabled();
  });

  it('should disable "next" on the last page', () => {
    renderPagination(3, 3);

    expect(screen.getByRole('button', { name: 'Página siguiente' })).toBeDisabled();
  });

  it('should not call back when the current page is clicked again', async () => {
    const user = userEvent.setup();
    const onPageChange = renderPagination(2, 3);

    await user.click(screen.getByRole('button', { name: 'Página 2' }));

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('should render nothing when there is a single page', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });
});
