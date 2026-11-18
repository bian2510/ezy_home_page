import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBox from '@/components/ui/SearchBox';

const renderBox = (defaultValue = '') => {
  const onSearch = vi.fn();
  render(
    <SearchBox
      label="Buscar productos"
      placeholder="Buscar…"
      defaultValue={defaultValue}
      onSearch={onSearch}
    />,
  );
  return onSearch;
};

describe('SearchBox', () => {
  it('should expose a search landmark with a labelled input', () => {
    renderBox();

    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: /buscar productos/i })).toBeInTheDocument();
  });

  it('should submit the trimmed text on Enter', async () => {
    const user = userEvent.setup();
    const onSearch = renderBox();

    await user.type(screen.getByRole('searchbox'), '  enchufe wifi {Enter}');

    expect(onSearch).toHaveBeenCalledWith('enchufe wifi');
  });

  it('should start with the given value', () => {
    renderBox('sensor');

    expect(screen.getByRole('searchbox')).toHaveValue('sensor');
  });
});
