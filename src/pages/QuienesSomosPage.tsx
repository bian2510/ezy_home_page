const COMPROMISOS = [
  {
    titulo: 'Profesionalismo',
    texto:
      'Cada producto está seleccionado y verificado. Te acompañamos antes, durante y después de la compra.',
  },
  {
    titulo: 'Accesibilidad',
    texto:
      'Precios pensados para el mercado argentino. Sin tecnicismos — si tenés dudas, las resolvemos por WhatsApp.',
  },
  {
    titulo: 'Confianza',
    texto:
      'Cerramos cada venta de forma asistida para asegurarnos de que elegiste el producto correcto y que llegue en perfectas condiciones.',
  },
] as const;

const PERFILES = [
  {
    icono: '🏠',
    titulo: 'Querés mejorar tu hogar',
    texto:
      'Tenés ganas de modernizar tu casa pero no sabés por dónde empezar. Te asesoramos para que el primer paso sea simple y tenga impacto real desde el día uno.',
  },
  {
    icono: '🔒',
    titulo: 'La seguridad es prioridad',
    texto:
      'Cámaras, detectores de humo o gas, sensores de movimiento. Soluciones concretas para que tu familia esté protegida sin necesitar instalar sistemas complejos.',
  },
  {
    icono: '💡',
    titulo: 'Empezás con algo pequeño',
    texto:
      'Una lamparita inteligente o un enchufe automatizado ya cambian la experiencia del hogar. No hace falta renovar todo — te ayudamos a escalar a tu ritmo.',
  },
] as const;

export default function QuienesSomosPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section
        aria-labelledby="quienes-somos-heading"
        className="bg-gradient-to-br from-sidebar to-sidebar-accent px-4 py-16 text-center sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-3xl">
          <h1
            id="quienes-somos-heading"
            className="text-4xl font-semibold tracking-tight text-sidebar-foreground sm:text-6xl"
          >
            Quiénes Somos
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-sidebar-foreground/80 sm:text-xl">
            Somos EzyHome — una tienda argentina de domótica que cree que el hogar inteligente debe
            estar al alcance de todos, no solo de los expertos.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-content px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex flex-col gap-16">
          {/* Misión + Problema en 2 columnas en desktop */}
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <section aria-labelledby="mision-heading" className="flex flex-col gap-4">
              <h2 id="mision-heading" className="text-2xl font-semibold text-foreground">
                Nuestra misión
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                Masificar la domótica haciéndola accesible, simple y confiable para hogares
                argentinos de todos los perfiles. Creemos que cualquier persona — joven, adulto
                mayor o cuidador de familia — puede adoptar la tecnología del hogar inteligente sin
                ser un experto.
              </p>
            </section>

            <section
              aria-labelledby="problema-heading"
              className="flex flex-col gap-4 rounded-xl border border-border bg-card px-6 py-6"
            >
              <h2 id="problema-heading" className="text-2xl font-semibold text-foreground">
                El problema que resolvemos
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                La domótica en Argentina es percibida como cara, compleja y exclusiva para personas
                técnicas. La mayoría de los hogares no accede porque no saben cómo empezar o los
                canales de venta no generan confianza.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                EzyHome existe para cerrar esa brecha: una tienda profesional y accesible que
                demuestre que la domótica está a tu alcance.
              </p>
            </section>
          </div>

          {/* ¿Para quién? */}
          <section aria-labelledby="para-quien-heading" className="flex flex-col gap-6">
            <div>
              <h2
                id="para-quien-heading"
                className="text-2xl font-semibold text-foreground sm:text-3xl"
              >
                ¿Para quién es EzyHome?
              </h2>
              <p className="mt-2 text-muted-foreground">
                No hace falta saber de tecnología. Solo hace falta querer mejorar tu hogar.
              </p>
            </div>
            <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-3">
              {PERFILES.map(({ icono, titulo, texto }) => (
                <li
                  key={titulo}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-card px-6 py-6 shadow-sm"
                >
                  <span className="text-3xl" aria-hidden="true">
                    {icono}
                  </span>
                  <span className="font-semibold text-foreground">{titulo}</span>
                  <span className="text-sm leading-relaxed text-muted-foreground">{texto}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Nuestro compromiso */}
          <section aria-labelledby="valores-heading" className="flex flex-col gap-6">
            <h2 id="valores-heading" className="text-2xl font-semibold text-foreground sm:text-3xl">
              Nuestro compromiso
            </h2>
            <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-3">
              {COMPROMISOS.map(({ titulo, texto }) => (
                <li
                  key={titulo}
                  className="flex flex-col gap-2 rounded-xl border-l-4 border-primary bg-card px-6 py-5 shadow-sm"
                >
                  <span className="font-semibold text-primary">{titulo}</span>
                  <span className="text-sm leading-relaxed text-muted-foreground">{texto}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
