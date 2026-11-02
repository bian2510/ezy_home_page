import { cn } from '@/lib/cn';

/**
 * Las categorías se muestran tal cual vienen de `src/data/products.json`: ese
 * archivo es la fuente de verdad (ver DOMAIN.md › Product Core). No hay tabla
 * de labels intermedia — una tabla desactualizada dejaba chips sin traducir y
 * obligaba a tocar dos archivos por cada categoría nueva.
 */
interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  /** Productos por categoría (dentro de la búsqueda actual). */
  counts: Record<string, number>;
  /** Productos de todas las categorías: el número del chip "Todos". */
  totalCount: number;
}

const chipBase =
  'inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';
const chipActive = 'bg-primary text-primary-foreground shadow-card';
const chipInactive = 'bg-muted text-muted-foreground hover:bg-border hover:text-foreground';

interface ChipProps {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

function Chip({ label, count, isActive, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(chipBase, isActive ? chipActive : chipInactive)}
    >
      <span>{label}</span> <span className="font-medium opacity-75">({count})</span>
    </button>
  );
}

/**
 * Category filter chips. Renders a "Todos" chip (clears the filter) plus one
 * chip per category, each with how many products it has. The active chip uses
 * the EzyHome primary token so the current filter is unambiguous on mobile
 * (BR-008, tap targets ≥ 44px). En el celular los chips son un riel con scroll
 * horizontal propio: la página nunca se corre de costado.
 */
export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  counts,
  totalCount,
}: CategoryFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filtrar por categoría"
      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0"
    >
      <Chip
        label="Todos"
        count={totalCount}
        isActive={selectedCategory === null}
        onClick={() => onSelectCategory(null)}
      />
      {categories.map((category) => (
        <Chip
          key={category}
          label={category}
          count={counts[category] ?? 0}
          isActive={selectedCategory === category}
          onClick={() => onSelectCategory(category)}
        />
      ))}
    </div>
  );
}
