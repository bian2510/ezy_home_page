// Por qué no se pudo crear el pedido en `/checkout`: el mensaje del ERP o de la
// red y, si falta stock (409), cuántas unidades hay y "Ajustar el carrito".
import { describeOrderError, type StockAdjustment } from './checkoutUtils';

interface OrderErrorAlertProps {
  error: unknown;
  adjustments: StockAdjustment[];
  onAdjust: () => void;
}

export default function OrderErrorAlert({ error, adjustments, onAdjust }: OrderErrorAlertProps) {
  return (
    <div
      role="alert"
      className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-foreground"
    >
      <p>{describeOrderError(error)}</p>
      {adjustments.length > 0 && (
        <>
          <ul className="mt-2 list-disc pl-5">
            {adjustments.map(({ productId, name, available }) => (
              <li key={productId}>
                {available > 0
                  ? `${name}: hay ${available} disponible${available === 1 ? '' : 's'}`
                  : `${name}: sin stock`}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onAdjust}
            className="mt-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Ajustar el carrito
          </button>
        </>
      )}
    </div>
  );
}
