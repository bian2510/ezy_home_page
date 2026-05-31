export default function QuienesSomosPage() {
  return (
    <div className="mx-auto flex max-w-prose flex-col gap-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Quiénes Somos
        </h1>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
          EzyHome — domótica accesible para el hogar argentino.
        </p>
      </header>

      <section aria-labelledby="mision-heading" className="flex flex-col gap-3">
        <h2 id="mision-heading" className="text-xl font-semibold text-foreground">
          Nuestra misión
        </h2>
        <p className="text-base text-muted-foreground">
          Masificar la domótica haciéndola accesible, simple y confiable para hogares argentinos de
          todos los perfiles. Creemos que cualquier persona —joven, adulto mayor o cuidador de
          familia— puede adoptar la tecnología del hogar inteligente sin ser un experto.
        </p>
      </section>

      <section
        aria-labelledby="problema-heading"
        className="flex flex-col gap-3 rounded-lg border border-border bg-card px-6 py-6"
      >
        <h2 id="problema-heading" className="text-xl font-semibold text-foreground">
          El problema que resolvemos
        </h2>
        <p className="text-base text-muted-foreground">
          La domótica en Argentina es percibida como cara, compleja y exclusiva para personas
          tecnológicas. La mayoría de los hogares no accede a soluciones de hogar inteligente porque
          no saben cómo empezar, los precios parecen prohibitivos o los canales de venta no generan
          confianza.
        </p>
        <p className="text-base text-muted-foreground">
          EzyHome existe para cerrar esa brecha: una tienda online con una cara profesional y
          accesible que demuestre que la domótica está al alcance de todos.
        </p>
      </section>

      <section aria-labelledby="clientes-heading" className="flex flex-col gap-3">
        <h2 id="clientes-heading" className="text-xl font-semibold text-foreground">
          A quién le vendemos
        </h2>
        <p className="text-base text-muted-foreground">
          Nuestro cliente típico es un adulto de 24 a 60 años que nos descubre a través de Instagram
          o Mercado Libre, navega desde su celular y busca mejorar su hogar de forma práctica y sin
          complicaciones.
        </p>
      </section>

      <section aria-labelledby="valores-heading" className="flex flex-col gap-4">
        <h2 id="valores-heading" className="text-xl font-semibold text-foreground">
          Nuestro compromiso
        </h2>
        <ul className="flex flex-col gap-3">
          {[
            {
              titulo: 'Profesionalismo',
              texto:
                'Cada producto está seleccionado y verificado. Te acompañamos antes, durante y después de la compra.',
            },
            {
              titulo: 'Accesibilidad',
              texto:
                'Precios pensados para el mercado argentino. Sin tecnicismos innecesarios — si tenés dudas, te las resolvemos por WhatsApp.',
            },
            {
              titulo: 'Confianza',
              texto:
                'Cerramos cada venta de forma asistida para asegurarnos de que elegiste el producto correcto y que llegue en perfectas condiciones.',
            },
          ].map(({ titulo, texto }) => (
            <li
              key={titulo}
              className="flex flex-col gap-1 rounded-lg border-l-4 border-primary bg-card px-5 py-4 shadow-sm"
            >
              <span className="font-medium text-primary">{titulo}</span>
              <span className="text-sm text-muted-foreground">{texto}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
