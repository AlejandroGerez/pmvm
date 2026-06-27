import Link from 'next/link'
import { MessageCircle, Calendar, MessageSquare, Rocket, Heart, Home } from 'lucide-react'

export default function EvaluacionGraciasPage({
  params,
}: {
  params: { locale: string }
}) {
  return (
    <div className="bg-[#0e0e0e] min-h-screen text-white px-4 py-12 flex items-center justify-center">
      <style>{`
        @keyframes particleBurst {
          0%   { opacity: 0; transform: translate(-50%, -50%) translate(0, 0) scale(0); }
          45%  { opacity: 1; transform: translate(-50%, -50%) translate(var(--tx), var(--ty)) scale(1.4); }
          100% { opacity: 0.85; transform: translate(-50%, -50%) translate(var(--tx), var(--ty)) scale(1); }
        }
        @keyframes particleFall {
          0%   { opacity: 0; transform: translate(-50%, -50%) translate(0, 0) scale(0); }
          35%  { opacity: 1; transform: translate(-50%, -50%) translate(var(--tx), var(--ty)) scale(1.4); }
          100% { opacity: 0; transform: translate(-50%, -50%) translate(var(--tx), calc(var(--ty) + 50px)) scale(0.6); }
        }
        .confetti       { opacity: 0; animation: particleBurst 0.9s ease-out forwards; }
        .confetti.fall  { animation: particleFall 1.3s ease-out forwards; }
      `}</style>
      {/* Ambient */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#c1ed00]/5 blur-[160px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center">

        {/* Ícono con partículas */}
        <div className="flex justify-center mb-8">
          <div className="relative flex items-center justify-center">

            {/* Partículas de confeti animadas */}
            {([
              { tx:'0px',   ty:'-85px',  s:'w-3 h-3',   c:'bg-[#c1ed00]',     d:'0ms',   fall:false },
              { tx:'55px',  ty:'-70px',  s:'w-2 h-2',   c:'bg-[#c1ed00]/80',  d:'30ms',  fall:true  },
              { tx:'85px',  ty:'-20px',  s:'w-2.5 h-2.5', c:'bg-white/60',    d:'60ms',  fall:false },
              { tx:'80px',  ty:'40px',   s:'w-2 h-2',   c:'bg-[#c1ed00]/70',  d:'90ms',  fall:true  },
              { tx:'45px',  ty:'80px',   s:'w-1.5 h-1.5', c:'bg-white/50',    d:'120ms', fall:false },
              { tx:'-45px', ty:'80px',   s:'w-3 h-3',   c:'bg-[#c1ed00]/65',  d:'50ms',  fall:true  },
              { tx:'-80px', ty:'40px',   s:'w-2 h-2',   c:'bg-white/45',      d:'80ms',  fall:false },
              { tx:'-85px', ty:'-20px',  s:'w-2.5 h-2.5', c:'bg-[#c1ed00]/75', d:'110ms', fall:true },
              { tx:'-55px', ty:'-70px',  s:'w-2 h-2',   c:'bg-white/40',      d:'140ms', fall:false },
              { tx:'30px',  ty:'-50px',  s:'w-1.5 h-1.5', c:'bg-[#c1ed00]/55', d:'20ms', fall:false },
              { tx:'50px',  ty:'15px',   s:'w-1.5 h-1.5', c:'bg-[#c1ed00]/45', d:'70ms', fall:true  },
              { tx:'15px',  ty:'52px',   s:'w-1 h-1',   c:'bg-white/35',      d:'100ms', fall:false },
              { tx:'-15px', ty:'52px',   s:'w-2 h-2',   c:'bg-[#c1ed00]/50',  d:'130ms', fall:true  },
              { tx:'-50px', ty:'15px',   s:'w-1.5 h-1.5', c:'bg-[#c1ed00]/40', d:'160ms', fall:false },
              { tx:'-30px', ty:'-50px',  s:'w-1 h-1',   c:'bg-white/30',      d:'190ms', fall:false },
              { tx:'105px', ty:'-50px',  s:'w-1 h-1',   c:'bg-[#c1ed00]/35',  d:'40ms',  fall:true  },
              { tx:'-105px',ty:'-50px',  s:'w-1 h-1',   c:'bg-[#c1ed00]/35',  d:'150ms', fall:true  },
              { tx:'65px',  ty:'-95px',  s:'w-1.5 h-1.5', c:'bg-white/25',    d:'75ms',  fall:false },
            ] as {tx:string,ty:string,s:string,c:string,d:string,fall:boolean}[]).map((p, i) => (
              <div
                key={i}
                className={`confetti${p.fall ? ' fall' : ''} absolute rounded-full ${p.s} ${p.c}`}
                style={{ top:'50%', left:'50%', '--tx':p.tx, '--ty':p.ty, animationDelay:p.d } as React.CSSProperties}
              />
            ))}

            {/* Anillos decorativos */}
            <div className="absolute w-36 h-36 rounded-full border border-[#c1ed00]/15" />
            <div className="absolute w-28 h-28 rounded-full border border-[#c1ed00]/25" />
            <div className="absolute w-20 h-20 rounded-full border-2 border-[#c1ed00]/40" />

            {/* Círculo con check */}
            <div className="w-14 h-14 rounded-full bg-[#c1ed00]/15 flex items-center justify-center">
              <svg className="w-7 h-7 text-[#c1ed00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

          </div>
        </div>

        {/* Título */}
        <h1 className="font-headline text-5xl font-black tracking-tighter mb-4">
          ¡SOLICITUD ENVIADA!
        </h1>

        {/* Subtítulo en lima */}
        <p className="text-[#c1ed00] font-bold text-lg mb-5">
          Gracias por confiar en mí. 💚
        </p>

        {/* Texto descriptivo */}
        <p className="text-white/50 text-base leading-relaxed mb-10">
          Recibí tu solicitud de evaluación correctamente.<br />
          Estoy muy contento de que hayas dado este paso<br />
          tan importante hacia tu transformación.
        </p>

        {/* Recuadro ¿Cómo es el proceso? */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#c1ed00] text-center py-5 px-6">
            ¿Cómo es el proceso?
          </p>
          <div className="relative">
            {/* Línea continua — los círculos con bg sólido y z-10 la tapan en cada nodo */}
            <div className="absolute left-[56px] top-0 bottom-[52px] w-px bg-gradient-to-b from-[#c1ed00]/15 via-[#c1ed00]/50 to-[#c1ed00]/15" />

            {[
              {
                icon: <MessageCircle size={28} />,
                title: '1. Reviso tu solicitud',
                text: 'Analizo tu información para entender tu situación actual, objetivos y necesidades.',
              },
              {
                icon: <Calendar size={28} />,
                title: '2. Me pongo en contacto',
                text: 'En las próximas 24 a 48 hs te escribiré por WhatsApp para agendar nuestra charla.',
              },
              {
                icon: <MessageSquare size={28} />,
                title: '3. Charla personalizada',
                text: 'Hablamos sobre tu caso, resolvemos tus dudas y te muestro el plan ideal para vos.',
              },
              {
                icon: <Rocket size={28} />,
                title: '4. Comenzamos tu transformación',
                text: 'Si decidís avanzar, te acompaño paso a paso para que logres resultados reales y sostenibles.',
              },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-5 text-left">
                <div className={`relative z-10 w-16 h-16 rounded-full bg-[#111111] border border-[#c1ed00]/25 flex items-center justify-center text-[#c1ed00] flex-shrink-0 ${i === 0 ? 'shadow-[0_0_24px_rgba(193,237,0,0.5)]' : ''}`}>
                  {step.icon}
                </div>
                <div>
                  <p className="text-white font-bold text-base mb-1">{step.title}</p>
                  <p className="text-white/50 text-base leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Frase final */}
        <div className="text-center pt-8 pb-6">
          <Heart size={36} className="text-[#c1ed00] mx-auto mb-5" />
          <p className="text-white font-bold text-base mb-2">
            Este es el comienzo de algo grande.
          </p>
          <p className="text-white/50 text-base mb-2">
            Estoy acá para acompañarte en cada paso del camino.
          </p>
          <p className="text-[#c1ed00] font-bold text-base">
            ¡Vamos por tu mejor versión! 💪
          </p>
        </div>

        {/* Botón */}
        <Link
          href={`/${params.locale}`}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-headline font-black text-sm bg-[#c1ed00] text-[#0e0e0e] hover:bg-[#d4ff00] transition-colors uppercase tracking-wider"
        >
          <Home size={16} />
          Volver al inicio
        </Link>

      </div>
    </div>
  )
}
