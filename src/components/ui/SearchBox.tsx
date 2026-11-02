import { useId, useState, type FormEvent } from 'react';
import { cn } from '@/lib/cn';
import Icon from './Icon';

/**
 * Buscador genérico: un `<form role="search">` con su campo. No sabe qué se
 * busca; avisa el texto (sin espacios alrededor) al enviar con Enter.
 */
interface SearchBoxProps {
  /** Nombre accesible del campo (no se muestra: el placeholder no alcanza). */
  label: string;
  placeholder: string;
  defaultValue?: string;
  onSearch: (query: string) => void;
  className?: string;
}

export default function SearchBox({
  label,
  placeholder,
  defaultValue = '',
  onSearch,
  className,
}: SearchBoxProps) {
  const [value, setValue] = useState(defaultValue);
  const inputId = useId();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form role="search" onSubmit={handleSubmit} className={cn('relative w-full', className)}>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        enterKeyHint="search"
        className={cn(
          'h-11 w-full rounded-lg border-0 bg-surface-container-lowest pl-10 pr-4 text-body-sm text-on-surface shadow-sm',
          'placeholder:text-on-surface-variant',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed',
        )}
      />
      <Icon
        name="search"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
      />
    </form>
  );
}
