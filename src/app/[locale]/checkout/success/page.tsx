import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CheckCircle, Clock } from 'lucide-react'

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
    <div className="bg-[#0e0e0e] min-h-screen text-white flex items-center justify-center px-4">
      {/* Ambient */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#c1ed00]/5 blur-[160px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 max-w-md w-full text-center">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          {isPending ? (
            <div className="w-20 h-20 rounded-full bg-yellow-400/10 flex items-center justify-center">
              <Clock className="w-10 h-10 text-yellow-400" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#c1ed00]/10 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-[#c1ed00]" />
            </div>
          )}
        </div>

        {/* Logo */}
        <p className="text-xs font-black tracking-widest text-[#c1ed00] mb-4">R3SET</p>

        {/* Title */}
        <h1 className="text-4xl font-black tracking-tighter mb-3">
          {isPending ? (
            <>PAGO EN<br /><span className="text-yellow-400">PROCESO.</span></>
          ) : (
            <>¡ACCESO<br /><span className="text-[#c1ed00]">ACTIVADO!</span></>
          )}
        </h1>

        {/* Subtitle */}
        <p className="text-white/50 mb-8 text-sm leading-relaxed">
          {isPending
            ? 'Tu pago está siendo procesado. Recibirás un email cuando se confirme.'
            : 'Tu pago fue aprobado. En minutos recibirás un email y WhatsApp con el acceso a tu cuenta y al dashboard R3SET.'}
        </p>

        {/* Plan info */}
        {sub && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/40 uppercase tracking-wider">Plan adquirido</span>
              <span
                className="text-xs font-black px-2 py-1 rounded-full"
                style={{ backgroundColor: '#c1ed00', color: '#0e0e0e' }}
              >
                {isPending ? 'PENDIENTE' : 'ACTIVO'}
              </span>
            </div>
            <p className="font-black text-xl text-white">{sub.plans?.name ?? sub.plan_id}</p>
            <p className="text-white/40 text-sm mt-1">{sub.plans?.duration_days ?? '—'} días de acceso</p>
          </div>
        )}

        {/* Next steps */}
        {!isPending && (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-5 mb-8 text-left">
            <p className="text-xs font-black tracking-widest text-[#c1ed00] uppercase mb-4">
              Próximos pasos
            </p>
            {[
              'Revisá tu email: ahí está el enlace y los datos para entrar al dashboard',
              'Ingresá al sitio desde el correo y usá tu email para iniciar sesión',
              'Completá tu perfil si te lo pedimos',
              '¡Empezá con tus rutinas personalizadas!',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: '#c1ed00', color: '#0e0e0e' }}
                >
                  {i + 1}
                </div>
                <p className="text-white/60 text-sm">{step}</p>
              </div>
            ))}
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <Link
            href={`/${params.locale}/dashboard`}
            className="block py-3.5 rounded-xl font-black text-sm bg-[#c1ed00] text-[#0e0e0e] hover:bg-[#d4ff00] transition-colors"
          >
            IR A MI DASHBOARD →
          </Link>
          <Link
            href={`/${params.locale}`}
            className="block py-3 rounded-xl font-bold text-sm text-white/30 hover:text-white/60 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>

      </div>
    </div>
  )
}
