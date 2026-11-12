// ComoComprarPage — los tres pasos de la compra, calcados del mock "Cómo
// comprar" (Stitch, 2026-11-12).
//
// El texto del mock se ajustó a lo que el sitio hace hoy: el checkout solo
// ofrece el retiro en punto pick-up (`DeliveryOptions`, "Sin cargo") y el envío
// a domicilio se coordina por WhatsApp (DOMAIN.md › How EzyHome Makes Money).
// Las fotos son las del mock, en `public/images/como-comprar/`.
import { Link } from 'react-router-dom';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Container from '@/components/ui/Container';
import Icon, { type IconName } from '@/components/ui/Icon';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

interface Step {
  number: string;
  icon: IconName;
  image: string;
  title: string;
  detail: string;
}

const STEPS: readonly Step[] = [
  {
    number: '01',
    icon: 'mobile',
    image: 'paso-1',
    title: 'Seleccioná tus productos inteligentes',
    detail:
      'Explorá nuestro catálogo de iluminación, seguridad, confort y hubs. Agregá al carrito los dispositivos que necesites: tu selección queda guardada aunque cierres el navegador.',
  },
  {
    number: '02',
    icon: 'truck',
    image: 'paso-2',
    title: 'Completá tus datos de entrega y facturación',
    detail:
      'Elegí el retiro sin cargo en nuestro punto pick-up o coordiná el envío a domicilio por WhatsApp. Dejá tus datos para la factura, si la necesitás.',
  },
  {
    number: '03',
    icon: 'wallet',
    image: 'paso-3',
    title: 'Aboná con transferencia o Mercado Pago',
    detail:
      'Transferí a la cuenta que te mostramos al confirmar el pedido o pagá con Mercado Pago, con tarjeta de débito o crédito.',
  },
];

const imageSrcSet = (name: string): string =>
  `/images/como-comprar/${name}-640.webp 640w, /images/como-comprar/${name}-1024.webp 1024w`;

export default function ComoComprarPage() {
  useDocumentMeta({
    title: 'Cómo Comprar',
    description:
      'Comprar en EzyHome es simple: elegí tus productos, completá tus datos de entrega y pagá con transferencia o Mercado Pago.',
    path: '/como-comprar',
  });

  return (
    <>
      <div className="w-full bg-surface-container-low">
        <Container className="py-2">
          <Breadcrumb items={[{ label: 'Cómo Comprar' }]} />
        </Container>
      </div>

      <section aria-labelledby="como-comprar-heading" className="w-full bg-surface">
        <Container className="flex flex-col items-center gap-4 py-12 text-center md:py-16">
          <h1
            id="como-comprar-heading"
            className="text-headline-xl-mobile font-extrabold tracking-tight text-on-surface md:text-headline-xl lg:text-5xl lg:leading-tight"
          >
            Cómo Comprar en <span className="text-primary">EzyHome</span>
          </h1>
          <p className="max-w-2xl text-body-lg text-on-surface-variant">
            Transformar tu hogar con tecnología inteligente es fácil y seguro. Seguí estos 3 simples
            pasos:
          </p>
        </Container>
      </section>

      <div className="w-full bg-surface-container-low">
        <Container className="py-12 md:py-20">
          <ol
            aria-label="Pasos para comprar"
            className="grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-3 md:gap-8"
          >
            {STEPS.map(({ number, icon, image, title, detail }, index) => (
              <li
                key={number}
                className="flex flex-col gap-6 rounded-2xl bg-surface-container-lowest p-6 shadow-sm sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <span
                    aria-hidden="true"
                    className="text-headline-xl font-extrabold text-primary/20"
                  >
                    {number}
                  </span>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon name={icon} className="h-6 w-6" />
                  </span>
                </div>

                <div className="relative overflow-hidden rounded-xl bg-surface-container">
                  <img
                    src={`/images/como-comprar/${image}-1024.webp`}
                    srcSet={imageSrcSet(image)}
                    sizes="(min-width: 768px) 33vw, 100vw"
                    alt=""
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    width={1024}
                    height={559}
                    className="aspect-video h-full w-full object-cover"
                  />
                  {index === 0 && (
                    <Link
                      to="/catalogo"
                      className="absolute bottom-3 left-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-inverse-surface/80 px-4 text-label-md font-bold text-inverse-on-surface backdrop-blur transition-colors hover:bg-inverse-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed"
                    >
                      <Icon name="cart" className="h-4 w-4" />
                      Ver el catálogo
                    </Link>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="text-headline-sm font-bold text-on-surface">{title}</h2>
                  <p className="text-body-md text-on-surface-variant">{detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </div>
    </>
  );
}
