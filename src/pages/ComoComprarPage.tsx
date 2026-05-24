import { Link } from 'react-router-dom';

const PASOS = [
  {
    numero: 1,
    titulo: 'Navegá el catálogo',
    descripcion:
      'Explorá nuestros productos organizados por categoría: iluminación, automatización y seguridad. Podés filtrar por tipo para encontrar lo que necesitás más rápido.',
    cta: { label: 'Ir al catálogo', to: '/catalogo' },
  },
  {
    numero: 2,
    titulo: 'Agregá productos al carrito',
    descripcion:
      'Hacé clic en "Agregar al carrito" en cada producto que te interese. Tu selección se guarda automáticamente aunque cierres el navegador o apagues el celular.',
    cta: null,
  },
  {
    numero: 3,
    titulo: 'Enviá tu pedido por WhatsApp',
    descripcion:
      'Cuando estés listo, ingresá al carrito y hacé clic en "Comprar por WhatsApp". Se pre-compone un mensaje con el detalle de tu pedido — solo tenés que enviarlo.',
    cta: { label: 'Ver carrito', to: '/carrito' },
  },
  {
    numero: 4,
    titulo: 'Recibís la confirmación',
    descripcion:
      'EzyHome te responde por WhatsApp con el total final del pedido incluyendo el costo de envío cotizado con Andreani o Correo Argentino según tu ubicación.',
    cta: null,
  },
  {
    numero: 5,
    titulo: 'Realizás el pago',
    descripcion:
      'Pagás por MercadoPago o transferencia bancaria. Te enviamos el comprobante de compra una vez confirmado el pago.',
    cta: null,
  },
  {
    numero: 6,
    titulo: 'Recibís en tu domicilio',
    descripcion:
      'Preparamos tu pedido y lo despachamos con Andreani o Correo Argentino. Te compartimos el número de seguimiento para que puedas rastrear tu envío.',
    cta: null,
  },
] as const;

export default function ComoComprarPage() {
  return (
    <div className="mx-auto flex max-w-prose flex-col gap-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Cómo Comprar
        </h1>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
          En EzyHome comprás de forma asistida — te acompañamos en cada paso
          para que llegues al producto correcto sin complicaciones.
        </p>
      </header>

      <ol className="flex flex-col gap-4" aria-label="Pasos para comprar">
        {PASOS.map(({ numero, titulo, descripcion, cta }) => (
          <li
            key={numero}
            className="flex gap-4 rounded-lg border border-border bg-card px-5 py-5 shadow-sm"
          >
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
            >
              {numero}
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="font-semibold text-foreground">{titulo}</h2>
              <p className="text-sm text-muted-foreground">{descripcion}</p>
              {cta && (
                <Link
                  to={cta.to}
                  className="mt-2 self-start text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {cta.label} →
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>

      <section
        aria-labelledby="dudas-heading"
        className="rounded-lg bg-primary px-6 py-6 text-primary-foreground"
      >
        <h2 id="dudas-heading" className="font-semibold text-lg">
          ¿Tenés dudas antes de comprar?
        </h2>
        <p className="mt-2 text-sm text-primary-foreground/90">
          Escribinos por WhatsApp y te ayudamos a elegir el producto ideal para
          tu hogar. Sin compromiso.
        </p>
      </section>
    </div>
  );
}
