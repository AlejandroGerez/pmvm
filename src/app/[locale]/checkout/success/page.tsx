import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, Clock, Lock, MessageCircle, User, Play, TrendingUp, Heart, Globe } from 'lucide-react'

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: { locale: string }
  searchParams: { sub?: string; status?: string }
}) {
  const subId = searchParams.sub
  const isPending = searchParams.status === 'pending'

  let sub: any = null

  if (subId) {
    const supabase = createClient()
    const { data } = await supabase
      .from('subscriptions')
      .select('*, plans(name, duration_days)')
      .eq('id', subId)
      .single()
    sub = data
  }

  return (
    <div className="bg-[#0e0e0e] min-h-screen text-white flex flex-col lg:block">
      {/* Ambient */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#c1ed00]/5 blur-[160px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 max-w-2xl w-full mx-auto px-4 pt-5 lg:py-8 flex flex-col flex-1 lg:block">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8 lg:mb-12">
          <span className="text-xl font-black text-[#c1ed00] font-headline tracking-[-0.04em] uppercase italic">
            R3SET
          </span>
          <div className="flex items-center gap-1.5">
            <Lock size={12} className="text-white/30 flex-shrink-0" />
            <span className="text-white/30 text-[10px] lg:text-[11px]">Pago 100% seguro con Mercado Pago</span>
          </div>
        </div>

        {/* Centered content wrapper */}
        <div className="flex-1 flex flex-col justify-center lg:block pb-5 lg:pb-0">
        <div className="max-w-lg mx-auto text-center">

        {/* Icon with decorative rings */}
        <style>{`
          @keyframes radarPulse {
            0%   { transform: scale(0.5); opacity: 0.55; }
            100% { transform: scale(2.4); opacity: 0; }
          }
          .radar-ring { animation: radarPulse 2.5s ease-out infinite; }
          .radar-ring-2 { animation-delay: 0.85s; }
          .radar-ring-3 { animation-delay: 1.7s; }
        `}</style>
        <div className="flex justify-center mb-4">
          <div className="relative flex items-center justify-center">
            {/* Anillos estáticos */}
            <div className="absolute w-36 h-36 rounded-full border border-[#c1ed00]/15" />
            <div className="absolute w-28 h-28 rounded-full border border-[#c1ed00]/25" />
            <div className="absolute w-20 h-20 rounded-full border-2 border-[#c1ed00]/40" />
            {/* Anillos pulsantes radar */}
            {isPending ? (
              <>
                <div className="radar-ring absolute w-14 h-14 rounded-full border border-yellow-400/50" />
                <div className="radar-ring radar-ring-2 absolute w-14 h-14 rounded-full border border-yellow-400/50" />
                <div className="radar-ring radar-ring-3 absolute w-14 h-14 rounded-full border border-yellow-400/50" />
              </>
            ) : (
              <>
                <div className="radar-ring absolute w-14 h-14 rounded-full border border-[#c1ed00]/50" />
                <div className="radar-ring radar-ring-2 absolute w-14 h-14 rounded-full border border-[#c1ed00]/50" />
                <div className="radar-ring radar-ring-3 absolute w-14 h-14 rounded-full border border-[#c1ed00]/50" />
              </>
            )}
            {isPending ? (
              <div className="w-14 h-14 rounded-full bg-yellow-400/10 flex items-center justify-center">
                <Clock className="w-7 h-7 text-yellow-400" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#c1ed00]/15 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-[#c1ed00]" />
              </div>
            )}
          </div>
        </div>

        {/* Label */}
        <p className={`text-center text-xs lg:text-base font-black uppercase tracking-[0.25em] mb-2 ${isPending ? 'text-yellow-400' : 'text-[#c1ed00]'}`}>
          {isPending ? '⏳ Pago en proceso' : '¡Pago exitoso!'}
        </p>

        {/* Title */}
        <h1 className="text-center font-headline text-3xl lg:text-5xl font-black tracking-tighter uppercase mb-3">
          {isPending ? (
            <>ESTAMOS<br /><span className="text-yellow-400">PROCESANDO TU PAGO</span></>
          ) : (
            <>¡Bienvenido a R<span className="text-[#c1ed00]">3</span>SET!</>
          )}
        </h1>

        {/* Subtitle */}
        <p className="text-center text-white/50 mb-4 lg:mb-8 text-xs lg:text-base leading-relaxed">
          {isPending
            ? <>Tu pago está siendo procesado.<br />Te avisaremos por WhatsApp cuando se confirme.</>

            : sub?.plans?.name || sub?.plan_id
              ? `Tu suscripción al ${sub.plans?.name ?? sub.plan_id} fue confirmada correctamente.`
              : 'Tu suscripción fue confirmada correctamente.'}
        </p>

        </div>{/* end centered wrapper */}

        {/* Bloque 1 — Aviso WhatsApp */}
        <div className="max-w-lg mx-auto border-t border-white/10 pt-4 mb-4">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-[#25D366]/10 border border-[#25D366]/25 flex items-center justify-center flex-shrink-0">
              <MessageCircle size={18} className="text-[#25D366]" />
            </div>
            <div>
              <p className="text-white font-bold text-sm lg:text-base mb-1">
                Te contactamos por WhatsApp en breve
              </p>
              <p className="hidden lg:block text-white/45 text-sm leading-relaxed">
                Te enviaremos toda la información para acceder a la plataforma y comenzar tu transformación.
              </p>
            </div>
          </div>
        </div>

        {/* Bloque 2 — ¿Qué sucede ahora? */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 lg:p-6 mb-4 lg:mb-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#c1ed00] mb-3 lg:mb-6 text-center">
            ¿Qué sucede ahora?
          </p>
          <div className="flex flex-row lg:flex-row items-center gap-1 lg:gap-3">
            {[
              { icon: <MessageCircle size={20} />, label: 'Te escribimos por WhatsApp', labelMobile: 'Te escribimos' },
              { icon: <User size={20} />,          label: 'Accedés a la plataforma',    labelMobile: 'Accedés' },
              { icon: <Play size={20} />,          label: 'Comenzás tu plan de entrenamiento', labelMobile: 'Comenzás' },
              { icon: <TrendingUp size={20} />,    label: 'Transformás tu cuerpo y tu vida',   labelMobile: 'Transformás' },
            ].map((step, i, arr) => (
              <div key={i} className="flex flex-row lg:flex-row items-center gap-1 lg:gap-4 flex-1">
                <div className="flex flex-col items-center gap-1.5 text-center w-full">
                  <div className="w-9 h-9 lg:w-16 lg:h-16 rounded-full bg-[#c1ed00]/10 border border-[#c1ed00]/25 flex items-center justify-center text-[#c1ed00]">
                    <span className="lg:hidden">{step.icon}</span>
                    <span className="hidden lg:block">{step.icon}</span>
                  </div>
                  <p className="lg:hidden text-white/60 text-[9px] leading-snug">{step.labelMobile}</p>
                  <p className="hidden lg:block text-white/60 text-sm leading-snug max-w-[100px]">{step.label}</p>
                </div>
                {i < arr.length - 1 && (
                  <>
                    <span className="text-white/20 text-xs flex-shrink-0 lg:hidden">→</span>
                    <span className="text-white/20 text-lg hidden lg:block flex-shrink-0">→</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Frase motivacional */}
        <div className="text-center pt-1 pb-3 lg:pt-3 lg:pb-6">
          <Heart size={22} className="text-[#c1ed00] mx-auto mb-2 lg:mb-4 lg:w-9 lg:h-9" />
          <p className="hidden lg:block text-white/60 text-base leading-relaxed">
            Este es el primer paso hacia tu mejor versión.
          </p>
          <p className="text-white font-bold text-sm lg:text-base mt-1">
            {isPending ? 'Te avisamos en cuanto se confirme.' : 'Estamos para acompañarte en todo el proceso.'}
          </p>
        </div>

        {/* Recuadro de contacto */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden mb-4 lg:mb-8">
          <div className="flex items-center">
            <Image src="/images/logoblanco.png" alt="R3SET" width={70} height={70} className="object-contain flex-shrink-0 -m-1.5 lg:w-[110px] lg:h-[110px] lg:-m-3" />
            <div className="py-2.5 pr-3 lg:py-3 lg:pr-4">
              <p className="text-[#c1ed00] font-black text-xs lg:text-base mb-0.5 lg:mb-1">
                Cualquier duda, estoy para ayudarte.
              </p>
              <p className="hidden lg:block text-white/45 text-sm leading-relaxed mb-2">
                Escribime directamente por WhatsApp y te respondo personalmente.
              </p>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_COACH_WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-white lg:text-[#c1ed00] font-bold text-xs lg:text-base hover:underline"
              >
                <MessageCircle size={12} />
                {process.env.NEXT_PUBLIC_COACH_PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </div>

        {/* Botón único */}
        <div className="flex justify-center">
          <Link
            href={`/${params.locale}`}
            className="flex items-center justify-center gap-2 lg:w-full px-8 py-2.5 lg:py-4 rounded-xl font-headline font-black text-sm lg:bg-[#c1ed00] lg:text-[#0e0e0e] border border-[#c1ed00]/50 text-[#c1ed00]/70 lg:border-0 hover:border-[#c1ed00] hover:text-[#c1ed00] lg:hover:bg-[#d4ff00] transition-colors uppercase tracking-wider"
          >
            <Globe size={14} />
            Volver al inicio
          </Link>
        </div>

        </div>{/* end flex-1 centering wrapper */}
      </div>
    </div>
  )
}
