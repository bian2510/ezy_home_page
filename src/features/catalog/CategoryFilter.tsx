import { cn } from '@/lib/cn';

/**
 * Spanish display label for each catalog category. Keys must match the
 * `category` field in `src/data/products.json` (see DOMAIN.md › Product Core).
 */
const CATEGORY_LABELS: Record<string, string> = {
  iluminacion: 'Iluminación',
  automatizacion: 'Automatización',
  seguridad: 'Seguridad',
};

const labelFor = (category: string): string => CATEGORY_LABELS[category] ?? category;

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const chipBase =
  'inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';
const chipActive = 'bg-primary text-primary-foreground';
const chipInactive = 'bg-muted text-foreground hover:bg-border';

/**
 * Category filter chips. Renders a "Todos" chip (clears the filter) plus one
 * chip per category. The active chip uses the EzyHome primary token so the
 * current filter is unambiguous on mobile (BR-008, tap targets ≥ 44px).
 */
export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  const isAllActive = selectedCategory === null;

  return (
    <div role="group" aria-label="Filtrar por categoría" className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSelectCategory(null)}
        aria-pressed={isAllActive}
        className={cn(chipBase, isAllActive ? chipActive : chipInactive)}
      >
        Todos
      </button>
      {categories.map((category) => {
        const isActive = selectedCategory === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelectCategory(category)}
            aria-pressed={isActive}
            className={cn(chipBase, isActive ? chipActive : chipInactive)}
          >
            {labelFor(category)}
          </button>
        );
      })}
    </div>
  );
}
