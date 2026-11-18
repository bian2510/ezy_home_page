// ProductDescription — tarjeta "Descripción" con el texto de `products.json`.
// Sin especificaciones técnicas en chips: no hay datos (usuario, 2026-11-03).
interface ProductDescriptionProps {
  description: string;
}

const HEADING_ID = 'descripcion-heading';

export default function ProductDescription({ description }: ProductDescriptionProps) {
  return (
    <section
      aria-labelledby={HEADING_ID}
      className="flex flex-col gap-3 rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-sm"
    >
      <div className="flex flex-col gap-1">
        <span className="text-label-sm font-bold uppercase tracking-wider text-primary">
          Detalle del producto
        </span>
        <h2 id={HEADING_ID} className="text-headline-md font-bold text-on-surface">
          Descripción
        </h2>
      </div>
      <p className="whitespace-pre-line text-body-lg text-on-surface">{description}</p>
    </section>
  );
}
