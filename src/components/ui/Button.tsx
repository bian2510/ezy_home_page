import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500',
  secondary:
    'bg-surface text-text border border-slate-300 hover:bg-surface-muted focus-visible:ring-brand-500',
  ghost: 'bg-transparent text-text hover:bg-surface-muted',
};

// Base button primitive. All call-to-action surfaces should compose from this.
export default function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const base =
    'inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60';
  return (
    <button className={`${base} ${variantClasses[variant]} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}
