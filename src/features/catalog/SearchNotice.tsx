// SearchNotice — avisa qué se está buscando (`?q=`) y permite volver al
// catálogo completo.
interface SearchNoticeProps {
  query: string;
  onClear: () => void;
}

export default function SearchNotice({ query, onClear }: SearchNoticeProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-muted-foreground">
        Resultados para <strong className="font-bold text-foreground">“{query}”</strong>
      </p>
      <button
        type="button"
        onClick={onClear}
        className="inline-flex min-h-11 items-center rounded px-2 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Ver todos los productos
      </button>
    </div>
  );
}
