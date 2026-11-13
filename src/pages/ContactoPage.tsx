// ContactoPage — los canales de contacto de la tienda: WhatsApp, email e
// Instagram, calcados del mock "Contáctanos".
//
// El horario de atención va fijo en `SITE_CONTACT` (el del ERP solo llega dentro
// de un pedido). La franja de "proyectos inmobiliarios" del mock solo se ve en local:
// el dueño no ofrece ese servicio todavía y lo decide antes del deploy
// (2026-11-06).
import Container from '@/components/ui/Container';
import ContactCard from '@/components/ui/ContactCard';
import ContactProjectsBand from '@/components/ui/ContactProjectsBand';
import Icon from '@/components/ui/Icon';
import PageHeader from '@/components/ui/PageHeader';
import { SITE_CONTACT } from '@/data/siteContact';
import { useToast } from '@/features/toast';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { getWhatsAppNumber, isDevelopment } from '@/lib/env';
import { cn } from '@/lib/cn';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';
const buttonClass = cn(
  'flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-label-lg font-bold transition-colors focus-visible:ring-offset-2',
  focusRing,
);
const primaryButton = cn(buttonClass, 'bg-primary text-on-primary hover:bg-primary-container');
const secondaryButton = cn(
  buttonClass,
  'bg-surface-container-high text-on-surface hover:bg-surface-container-highest',
);
export default function ContactoPage() {
  useDocumentMeta({
    title: 'Contactanos',
    description:
      'Escribinos por WhatsApp, email o Instagram: te asesoramos sobre compatibilidad de dispositivos, soporte técnico, cotizaciones y el seguimiento de tu compra.',
    path: '/contacto',
  });
  const { addToast } = useToast();
  const whatsAppNumber = getWhatsAppNumber();

  // El portapapeles no existe fuera de un contexto seguro (http) ni en algunos
  // navegadores viejos, y puede rechazar por permisos: en los dos casos se
  // avisa y se muestra el email para copiarlo a mano.
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SITE_CONTACT.email);
      addToast('Email copiado');
    } catch {
      addToast(`No pudimos copiar el email. Copialo a mano: ${SITE_CONTACT.email}`, 'error');
    }
  };

  return (
    <>
      <PageHeader
        id="contacto-heading"
        breadcrumb={[{ label: 'Contactanos' }]}
        title="Estamos acá para ayudarte a transformar tu hogar"
      >
        Si tenés dudas sobre compatibilidad de dispositivos, soporte técnico, cotizaciones o el
        seguimiento de tu compra, escribinos y te asesoramos.
      </PageHeader>

      <Container className="relative -mt-4 pb-4">
        <ul aria-label="Canales de contacto" className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <ContactCard
            icon="chat"
            title="WhatsApp"
            action={
              // Sin número configurado el link no lleva a ningún lado: no se muestra.
              whatsAppNumber !== '' && (
                <a
                  href={`https://wa.me/${whatsAppNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={primaryButton}
                >
                  <Icon name="chat" />
                  Escribinos por WhatsApp
                </a>
              )
            }
          >
            <span>{SITE_CONTACT.phone}</span>
            <span className="text-right text-label-sm font-semibold text-on-surface-variant">
              {SITE_CONTACT.hours}
            </span>
          </ContactCard>
          <ContactCard
            icon="mail"
            title="Email"
            action={
              <a href={`mailto:${SITE_CONTACT.email}`} className={secondaryButton}>
                <Icon name="mail" />
                Enviar un email
              </a>
            }
          >
            <span className="min-w-0 break-all text-body-md font-semibold">
              {SITE_CONTACT.email}
            </span>
            <button
              type="button"
              aria-label="Copiar email"
              onClick={() => void handleCopyEmail()}
              className={cn(
                'inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-primary hover:bg-primary/10',
                focusRing,
              )}
            >
              <Icon name="copy" />
            </button>
          </ContactCard>
          <ContactCard
            icon="camera"
            title="Instagram"
            action={
              <a
                href={SITE_CONTACT.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className={secondaryButton}
              >
                <Icon name="externalLink" />
                Seguinos en Instagram
              </a>
            }
          >
            {SITE_CONTACT.instagram.handle}
          </ContactCard>
        </ul>

        {isDevelopment() && (
          <div className="mt-12 md:mt-16">
            <ContactProjectsBand
              whatsAppHref={whatsAppNumber === '' ? null : `https://wa.me/${whatsAppNumber}`}
            />
          </div>
        )}
      </Container>
    </>
  );
}
