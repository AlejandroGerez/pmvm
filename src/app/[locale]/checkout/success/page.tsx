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
    <div className="bg-[#0e0e0e] min-h-screen text-white px-4 py-8">
      {/* Ambient */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#c1ed00]/5 blur-[160px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 max-w-2xl w-full mx-auto">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-12">
          <span className="text-xl font-black text-[#c1ed00] font-headline tracking-[-0.04em] uppercase italic">
            R3SET
          </span>
          <div className="flex items-center gap-2">
            <Lock size={13} className="text-white/30 flex-shrink-0" />
            <span className="text-white/30 text-[11px]">Pago 100% seguro con Mercado Pago</span>
          </div>
        </div>

        {/* Centered content wrapper */}
        <div className="max-w-lg mx-auto text-center">

        {/* Icon with decorative rings */}
        <div className="flex justify-center mb-6">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-36 h-36 rounded-full border border-[#c1ed00]/15" />
            <div className="absolute w-28 h-28 rounded-full border border-[#c1ed00]/25" />
            <div className="absolute w-20 h-20 rounded-full border-2 border-[#c1ed00]/40" />
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
        <p className="text-center text-base font-black uppercase tracking-[0.25em] text-[#c1ed00] mb-4">
          {isPending ? '⏳ Pago en proceso' : '¡Pago exitoso!'}
        </p>

        {/* Title */}
        <h1 className="text-center font-headline text-5xl font-black tracking-tighter uppercase mb-5">
          {isPending ? (
            <>ESTAMOS<br /><span className="text-yellow-400">PROCESANDO TU PAGO</span></>
          ) : (
            <>¡Bienvenido a R<span className="text-[#c1ed00]">3</span>SET!</>
          )}
        </h1>

        {/* Subtitle */}
        <p className="text-center text-white/50 mb-8 text-base leading-relaxed">
          {isPending
            ? <>Tu pago está siendo procesado.<br />Te avisaremos por WhatsApp cuando se confirme.</>

            : sub?.plans?.name || sub?.plan_id
              ? `Tu suscripción al ${sub.plans?.name ?? sub.plan_id} fue confirmada correctamente.`
              : 'Tu suscripción fue confirmada correctamente.'}
        </p>

        </div>{/* end centered wrapper */}

        {/* Bloque 1 — Aviso WhatsApp */}
        <div className="max-w-lg mx-auto border-t border-white/10 pt-6 mb-6">
          <div className="flex items-start gap-4 justify-center">
            <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 border border-[#25D366]/25 flex items-center justify-center flex-shrink-0">
              <MessageCircle size={22} className="text-[#25D366]" />
            </div>
            <div>
              <p className="text-white font-bold text-base mb-1 whitespace-nowrap">
                En las próximas horas te contactaremos por WhatsApp
              </p>
              <p className="text-white/45 text-sm leading-relaxed">
                Te enviaremos toda la información para que puedas<br />acceder a la plataforma y comenzar tu transformación.
              </p>
            </div>
          </div>
        </div>

        {/* Bloque 2 — ¿Qué sucede ahora? */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#c1ed00] mb-6">
            ¿Qué sucede ahora?
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {[
              { icon: <MessageCircle size={26} />, label: 'Te escribimos por WhatsApp' },
              { icon: <User size={26} />,          label: 'Te damos acceso a la plataforma' },
              { icon: <Play size={26} />,          label: 'Comenzás con tu plan de entrenamiento' },
              { icon: <TrendingUp size={26} />,    label: 'Transformás tu cuerpo y tu vida' },
            ].map((step, i, arr) => (
              <div key={i} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <div className="flex flex-col items-center gap-3 flex-1 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#c1ed00]/10 border border-[#c1ed00]/25 flex items-center justify-center text-[#c1ed00]">
                    {step.icon}
                  </div>
                  <p className="text-white/60 text-sm leading-snug max-w-[130px]">{step.label}</p>
                </div>
                {i < arr.length - 1 && (
                  <>
                    <span className="text-white/20 text-lg hidden sm:block">→</span>
                    <span className="text-white/20 text-lg sm:hidden">↓</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Frase motivacional */}
        <div className="text-center pt-3 pb-6">
          <Heart size={36} className="text-[#c1ed00] mx-auto mb-4" />
          <p className="text-white/60 text-base leading-relaxed">
            Este es el primer paso hacia tu mejor versión.
          </p>
          <p className="text-white font-bold text-base mt-1">
            Estamos para acompañarte en todo el proceso.
          </p>
        </div>

        {/* Recuadro de contacto */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden mb-8">
          <div className="flex items-center justify-center">
            <Image src="/images/logoblanco.png" alt="R3SET" width={110} height={110} className="object-contain flex-shrink-0 -m-3" />
            <div className="py-3 pr-4">
              <p className="text-[#c1ed00] font-black text-base mb-1">
                Cualquier duda, estoy para ayudarte.
              </p>
              <p className="text-white/45 text-sm leading-relaxed mb-2">
                Escribime directamente por WhatsApp<br />y te respondo personalmente.
              </p>
              <a
                href="https://wa.me/5491170632860"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[#c1ed00] font-bold text-base hover:underline"
              >
                <MessageCircle size={16} />
                +54 9 11 7063-2860
              </a>
            </div>
          </div>
        </div>

        {/* Botón único */}
        <Link
          href={`/${params.locale}`}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-headline font-black text-sm bg-[#c1ed00] text-[#0e0e0e] hover:bg-[#d4ff00] transition-colors uppercase tracking-wider"
        >
          <Globe size={16} />
          Volver al inicio
        </Link>

      </div>
    </div>
  )
}
