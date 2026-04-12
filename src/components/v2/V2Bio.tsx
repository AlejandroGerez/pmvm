import Image from "next/image";

export default function V2Bio() {
  return (
    <section className="py-32 bg-brand-dark scroll-mt-32" id="bio">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <div className="order-2 md:order-1">
            <h3 className="text-brand-accent font-heading font-bold tracking-[0.4em] uppercase text-xs mb-6">
              Mi Viaje Personal
            </h3>
            <h2 className="text-4xl md:text-5xl font-heading font-black mb-10 uppercase leading-tight">
              De la lucha a la{" "}
              <span className="text-brand-accent">Maestría</span>
            </h2>
            <div className="space-y-8 text-brand-text/70 leading-relaxed text-lg font-light">
              <p>
                Desde chico, por usar la comida como vía de escape a un montón
                de situaciones que vivía y no sabía gestionar, llegué a un grado
                de obesidad que limitaba mi vida. La frustración y el
                sentimiento de no ser suficiente eran mi motor diario, hasta que
                decidí que mi historia no podía terminar así.
              </p>
              <p>
                Empecé mi viaje en el programa de televisión &quot;Cuestión de
                Peso&quot;, donde no solo perdí peso frente a miles de personas,
                sino que descubrí mi verdadera vocación: entender la ciencia del
                cuerpo y la psicología del cambio. Ese fue el chispazo que
                inició una década de estudio y formación constante.
              </p>
              <p>
                Hoy, puedo decir que me transformé desde un lugar de paz y
                disciplina, no de odio hacia mi cuerpo. He dedicado mi vida a
                que otros no tengan que pasar por ese laberinto de confusión y
                puedan alcanzar su mejor versión con un método probado,
                profesional y profundamente humano.
              </p>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="relative group">
              <div className="absolute inset-0 bg-brand-accent/5 -rotate-3 rounded-sm transition-transform duration-700 group-hover:rotate-0" />
              <Image
                alt="Alejandro Gerez Profesional"
                className="relative z-10 w-full rounded-sm shadow-2xl grayscale group-hover:grayscale-0 group-hover:scale-[1.03] transition-transform duration-700"
                src="/images/aboutme/imagen2.jpg"
                width={900}
                height={1200}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
