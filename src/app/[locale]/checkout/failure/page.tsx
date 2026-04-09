import Link from 'next/link'
import { XCircle } from 'lucide-react'

export default function CheckoutFailurePage({
  params,
  searchParams,
}: {
  params: { locale: string }
  searchParams: { sub?: string }
}) {
  return (
    <div className="bg-[#0e0e0e] min-h-screen text-white flex items-center justify-center px-4">
      {/* Ambient */}
      <div className="fixed top-0 left-1/2 w-[500px] h-[500px] bg-red-500/5 blur-[160px] rounded-full -translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 max-w-md w-full text-center">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-400" />
          </div>
        </div>

        {/* Logo */}
        <p className="text-xs font-black tracking-widest text-[#c1ed00] mb-4">R3SET</p>

        {/* Title */}
        <h1 className="text-4xl font-black tracking-tighter mb-3">
          PAGO<br />
          <span className="text-red-400">NO PROCESADO.</span>
        </h1>

        <p className="text-white/50 mb-8 text-sm leading-relaxed">
          Tu pago no pudo completarse. No se realizó ningún cargo a tu cuenta.
          Podés intentarlo de nuevo cuando quieras.
        </p>

        {/* Reasons */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-5 mb-8 text-left">
          <p className="text-xs font-black tracking-widest text-red-400 uppercase mb-4">
            Posibles causas
          </p>
          {[
            'Fondos insuficientes en tu cuenta',
            'La tarjeta fue rechazada por tu banco',
            'Cancelaste el proceso de pago',
            'Problema temporal con Mercado Pago',
          ].map((reason, i) => (
            <div key={i} className="flex items-start gap-3 mb-2 last:mb-0">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400/60 flex-shrink-0 mt-1.5" />
              <p className="text-white/50 text-sm">{reason}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <Link
            href={`/${params.locale}#pricing`}
            className="block py-3.5 rounded-xl font-black text-sm bg-[#c1ed00] text-[#0e0e0e] hover:bg-[#d4ff00] transition-colors"
          >
            INTENTAR DE NUEVO
          </Link>
          <a
            href="https://wa.me/5491100000000"
            target="_blank"
            rel="noopener noreferrer"
            className="block py-3 rounded-xl font-bold text-sm border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors"
          >
            Contactar soporte por WhatsApp
          </a>
          <Link
            href={`/${params.locale}`}
            className="block py-3 rounded-xl font-bold text-sm text-white/30 hover:text-white/50 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>

      </div>
    </div>
  )
}
