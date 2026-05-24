// Lightweight class-name joiner used by UI primitives.
// Avoids pulling in clsx until we have a real need.
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
