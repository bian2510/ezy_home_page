// TransferDetails — a qué cuenta transferir un pedido por transferencia que
// espera el pago: alias, CBU/CVU, titular y banco (solo los que cargó la
// tienda), el concepto, el vencimiento y el aviso por email.
import { formatDeadline } from './checkoutUtils';
import type { StoreOrder } from './ordersApi';

export default function TransferDetails({ order }: { order: StoreOrder }) {
  const { alias, cbu, holder, bank } = order.transfer;
  const rows: [string, string | null][] = [
    ['Alias', alias],
    ['CBU/CVU', cbu],
    ['Titular', holder],
    ['Banco', bank],
  ];
  const deadline = formatDeadline(order.expiresAt);

  return (
    <section
      aria-labelledby="transferencia-heading"
      className="flex flex-col gap-3 rounded-lg bg-surface-container-lowest p-4 shadow-sm md:p-6"
    >
      <h2 id="transferencia-heading" className="text-headline-sm font-bold text-on-surface">
        Transferí a esta cuenta
      </h2>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-body-md">
        {rows
          .filter((row): row is [string, string] => row[1] !== null)
          .map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-secondary">{label}</dt>
              <dd className="break-all font-mono text-on-surface">{value}</dd>
            </div>
          ))}
      </dl>
      <p className="text-body-md text-on-surface">
        En el concepto poné &quot;Pedido {order.number}&quot;.
      </p>
      {deadline !== null && (
        <p className="text-body-sm text-secondary">
          Transferí antes del {deadline} (hora de Argentina). Si no, el pedido vence.
        </p>
      )}
      <p className="text-body-sm text-secondary">
        Te avisamos por email cuando acreditemos el pago.
      </p>
    </section>
  );
}
