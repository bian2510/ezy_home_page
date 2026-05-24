import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Pill-shaped status indicator used to surface product flags such as
 * "Oferta" (warning) or "Más vendido" (success). The component renders a
 * `<span>` styled with EzyHome design tokens — no external library needed.
 *
 * Variants map to semantic tokens defined in `tailwind.config.ts`:
 *  - `warning` → bg-warning / text-warning-foreground   (e.g. price drop)
 *  - `success` → bg-success / text-white                (e.g. bestseller)
 *  - `default` → bg-muted    / text-muted-foreground    (neutral fallback)
 *
 * Color is paired with text inside the badge so it never becomes the sole
 * indicator (DOMAIN.md › Design Implications: trust & accessibility).
 */
export type BadgeVariant = 'warning' | 'success' | 'default';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  warning: 'bg-warning text-warning-foreground',
  success: 'bg-success text-white',
  default: 'bg-muted text-muted-foreground',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
