import Link from 'next/link'
import Image from 'next/image'
import { AlertCircle, Lock, Shield, CreditCard, Wallet, Wifi, RefreshCw, Heart, MessageCircle } from 'lucide-react'

export default function CheckoutFailurePage({
  params,
  searchParams,
}: {
  params: { locale: string }
  searchParams: { sub?: string }
}) {
  return (
    <div className="bg-[#0e0e0e] min-h-screen text-white px-4 py-8">
      {/* Ambient */}
      <div className="fixed top-0 left-1/2 w-[500px] h-[500px] bg-red-500/5 blur-[160px] rounded-full -translate-y-1/2 -translate-x-1/2 pointer-events-none" />

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

        {/* Centered header */}
        <div className="max-w-lg mx-auto text-center">

          {/* Icon with decorative rings */}
          <style>{`
            @keyframes radarPulseRed {
              0%   { transform: scale(0.5); opacity: 0.45; }
              100% { transform: scale(2.4); opacity: 0; }
            }
            .radar-red { animation: radarPulseRed 2.5s ease-out infinite; }
            .radar-red-2 { animation-delay: 0.85s; }
            .radar-red-3 { animation-delay: 1.7s; }
          `}</style>
          <div className="flex justify-center mb-6">
            <div className="relative flex items-center justify-center">
              {/* Anillos estáticos */}
              <div className="absolute w-44 h-44 rounded-full border border-red-400/15" />
              <div className="absolute w-36 h-36 rounded-full border border-red-400/25" />
              <div className="absolute w-24 h-24 rounded-full border-2 border-red-400/40" />
              {/* Anillos pulsantes radar */}
              <div className="radar-red absolute w-16 h-16 rounded-full border border-red-400/40" />
              <div className="radar-red radar-red-2 absolute w-16 h-16 rounded-full border border-red-400/40" />
              <div className="radar-red radar-red-3 absolute w-16 h-16 rounded-full border border-red-400/40" />
              <div className="w-16 h-16 rounded-full bg-red-400/15 flex items-center justify-center">
                <AlertCircle className="w-9 h-9 text-red-400" />
              </div>
            </div>
          </div>

          {/* Label */}
          <p className="text-base font-black uppercase tracking-[0.25em] text-red-400 mb-4">
            Casi lo logramos
          </p>

          {/* Title */}
          <h1 className="font-headline text-5xl font-black tracking-tighter uppercase mb-5">
            Tu pago no pudo procesarse
          </h1>

          {/* Subtitle */}
          <p className="text-white/50 text-base leading-relaxed mb-8">
            No te preocupes, no se realizó ningún cobro.<br />
            Podés intentarlo nuevamente cuando quieras.
          </p>

        </div>{/* end centered header */}

        {/* Bloque 1 — Seguridad */}
        <div className="max-w-lg mx-auto border-t border-white/10 pt-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-red-400/10 border border-red-400/25 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Shield size={22} className="text-red-400" />
            </div>
            <div>
              <p className="text-white font-bold text-lg mb-1">
                Tu seguridad es nuestra prioridad.
              </p>
              <p className="text-white/45 text-base leading-relaxed">
                Si el problema persiste, puede deberse a tu banco<br />o al método de pago. Te ayudamos a resolverlo.
              </p>
            </div>
          </div>
        </div>

        {/* Bloque 2 — ¿Qué podés hacer? */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-400 mb-6">
            ¿Qué podés hacer?
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {[
              { icon: <CreditCard size={26} />, label: 'Revisá los datos de tu tarjeta' },
              { icon: <Wallet size={26} />,     label: 'Probá con otro método de pago' },
              { icon: <Wifi size={26} />,       label: 'Verificá tu conexión a internet' },
              { icon: <RefreshCw size={26} />,  label: 'Volvé a intentarlo' },
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
            Estamos para ayudarte en todo el proceso.
          </p>
          <p className="text-white font-bold text-base mt-1">
            No te rindas, tu cambio empieza hoy.
          </p>
        </div>

        {/* Recuadro de contacto */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden mb-8">
          <div className="flex items-center justify-center">
            <Image src="/images/logoblanco.png" alt="R3SET" width={110} height={110} className="object-contain flex-shrink-0 -m-3" />
            <div className="py-3 pr-4">
              <p className="text-red-400 font-black text-base mb-1">
                ¿Necesitás ayuda?
              </p>
              <p className="text-white/45 text-sm leading-relaxed mb-2">
                Escribinos por WhatsApp<br />y te respondemos personalmente.
              </p>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_COACH_WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[#c1ed00] font-bold text-base hover:underline"
              >
                <MessageCircle size={16} />
                {process.env.NEXT_PUBLIC_COACH_PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col items-center gap-3 max-w-lg mx-auto">
          <Link
            href={`/${params.locale}/checkout`}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-headline font-black text-sm bg-[#c1ed00] text-[#0e0e0e] hover:bg-[#d4ff00] transition-colors uppercase tracking-wider"
          >
            <RefreshCw size={16} />
            Volver a intentar
          </Link>
          <Link
            href={`/${params.locale}`}
            className="text-sm text-white/30 hover:text-white/60 transition-colors"
          >
            ← Volver a la web
          </Link>
        </div>

      </div>
    </div>
  )
}
