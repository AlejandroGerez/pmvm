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
    <div className="bg-[#0e0e0e] min-h-screen text-white flex flex-col lg:block">
      {/* Ambient */}
      <div className="fixed top-0 left-1/2 w-[500px] h-[500px] bg-red-500/5 blur-[160px] rounded-full -translate-y-1/2 -translate-x-1/2 pointer-events-none" />

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

        {/* Flex-1 centering wrapper — mobile only */}
        <div className="flex-1 flex flex-col justify-center lg:block pb-5 lg:pb-0">

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
          <div className="flex justify-center mb-4">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-44 h-44 rounded-full border border-red-400/15" />
              <div className="absolute w-36 h-36 rounded-full border border-red-400/25" />
              <div className="absolute w-24 h-24 rounded-full border-2 border-red-400/40" />
              <div className="radar-red absolute w-16 h-16 rounded-full border border-red-400/40" />
              <div className="radar-red radar-red-2 absolute w-16 h-16 rounded-full border border-red-400/40" />
              <div className="radar-red radar-red-3 absolute w-16 h-16 rounded-full border border-red-400/40" />
              <div className="w-16 h-16 rounded-full bg-red-400/15 flex items-center justify-center">
                <AlertCircle className="w-9 h-9 text-red-400" />
              </div>
            </div>
          </div>

          {/* Label */}
          <p className="text-xs lg:text-base font-black uppercase tracking-[0.25em] text-red-400 mb-2 lg:mb-4">
            Casi lo logramos
          </p>

          {/* Title */}
          <h1 className="font-headline text-3xl lg:text-5xl font-black tracking-tighter uppercase mb-3 lg:mb-5">
            Tu pago no pudo procesarse
          </h1>

          {/* Subtitle */}
          <p className="text-white/50 text-xs lg:text-base leading-relaxed mb-4 lg:mb-8">
            No te preocupes, no se realizó ningún cobro.<br />
            Podés intentarlo nuevamente cuando quieras.
          </p>

        </div>

        {/* Bloque 1 — Seguridad */}
        <div className="max-w-lg mx-auto border-t border-white/10 pt-4 mb-4 lg:pt-6 lg:mb-6">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-red-400/10 border border-red-400/25 flex items-center justify-center flex-shrink-0">
              <Shield size={18} className="text-red-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm lg:text-lg mb-0.5 lg:mb-1">
                Tu seguridad es nuestra prioridad.
              </p>
              <p className="hidden lg:block text-white/45 text-base leading-relaxed">
                Si el problema persiste, puede deberse a tu banco o al método de pago. Te ayudamos a resolverlo.
              </p>
            </div>
          </div>
        </div>

        {/* Bloque 2 — ¿Qué podés hacer? */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 lg:p-6 mb-4 lg:mb-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-400 mb-3 lg:mb-6 text-center">
            ¿Qué podés hacer?
          </p>
          <div className="flex flex-row lg:flex-row items-center gap-1 lg:gap-3">
            {[
              { icon: <CreditCard size={20} />, label: 'Revisá los datos de tu tarjeta', labelMobile: 'Revisá tu tarjeta' },
              { icon: <Wallet size={20} />,     label: 'Probá con otro método de pago', labelMobile: 'Otro método' },
              { icon: <Wifi size={20} />,       label: 'Verificá tu conexión a internet', labelMobile: 'Tu conexión' },
              { icon: <RefreshCw size={20} />,  label: 'Volvé a intentarlo', labelMobile: 'Intentalo de nuevo' },
            ].map((step, i, arr) => (
              <div key={i} className="flex flex-row lg:flex-row items-center gap-1 lg:gap-4 flex-1">
                <div className="flex flex-col items-center gap-1.5 text-center w-full">
                  <div className="w-9 h-9 lg:w-16 lg:h-16 rounded-full bg-[#c1ed00]/10 border border-[#c1ed00]/25 flex items-center justify-center text-[#c1ed00]">
                    {step.icon}
                  </div>
                  <p className="lg:hidden text-white/60 text-[9px] leading-snug">{step.labelMobile}</p>
                  <p className="hidden lg:block text-white/60 text-sm leading-snug max-w-[130px]">{step.label}</p>
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
            Estamos para ayudarte en todo el proceso.
          </p>
          <p className="text-white font-bold text-sm lg:text-base mt-1">
            No te rindas, tu cambio empieza hoy.
          </p>
        </div>

        {/* Recuadro de contacto */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden mb-4 lg:mb-8">
          <div className="flex items-center">
            <Image src="/images/logoblanco.png" alt="R3SET" width={70} height={70} className="object-contain flex-shrink-0 -m-1.5 lg:w-[110px] lg:h-[110px] lg:-m-3" />
            <div className="py-2.5 pr-3 lg:py-3 lg:pr-4">
              <p className="text-red-400 font-black text-xs lg:text-base mb-0.5 lg:mb-1">
                ¿Necesitás ayuda?
              </p>
              <p className="hidden lg:block text-white/45 text-sm leading-relaxed mb-2">
                Escribinos por WhatsApp y te respondemos personalmente.
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

        {/* Botones */}
        <div className="flex flex-col items-center gap-3 max-w-lg mx-auto">
          <Link
            href={`/${params.locale}/checkout`}
            className="flex items-center justify-center gap-2 w-full py-3 lg:py-4 rounded-xl font-headline font-black text-xs lg:text-sm bg-[#c1ed00] text-[#0e0e0e] hover:bg-[#d4ff00] transition-colors uppercase tracking-normal px-6"
          >
            <RefreshCw size={16} />
            Volver a intentar
          </Link>
          <Link
            href={`/${params.locale}`}
            className="text-[10px] text-white/25 hover:text-white/50 transition-colors"
          >
            ← Volver a la web
          </Link>
        </div>

        </div>{/* end flex-1 centering wrapper */}
      </div>
    </div>
  )
}
