'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, Zap, Star } from 'lucide-react'
import Link from 'next/link'

const plans = [
  {
    id: 'monthly',
    name: 'Plan Mensual',
    price: 100,
    days: 30,
    badge: null,
    color: '#00e3fd',
    description: 'Perfecto para empezar. Un mes de entrenamiento personalizado y seguimiento.',
    features: [
      'Rutina personalizada en tu dashboard',
      'Seguimiento semanal de progreso',
      'Chat directo con tu coach',
      'Acceso al dashboard personal',
      'Email + WhatsApp de bienvenida',
    ],
  },
  {
    id: 'quarterly',
    name: 'Plan Trimestral',
    price: 150,
    days: 90,
    badge: 'MÁS POPULAR',
    color: '#c1ed00',
    description: '3 meses para construir hábitos reales. (Precio de prueba en producción.)',
    features: [
      'Todo lo del plan mensual',
      'Actualizaciones de rutina cada 4 semanas',
      'Análisis de progreso mensual',
      'Prioridad de respuesta del coach',
      'Mejor relación costo/duración que el mensual',
    ],
  },
  {
    id: 'semiannual',
    name: 'Plan Semestral',
    price: 200,
    days: 180,
    badge: 'MEJOR VALOR',
    color: '#ff734a',
    description: '6 meses de transformación completa. (Precio de prueba en producción.)',
    features: [
      'Todo lo del plan trimestral',
      'Plan nutricional básico incluido',
      'Check-in quincenal por videollamada',
      'Comunidad privada de alumnos',
      'Máxima continuidad para resultados duraderos',
    ],
  },
]

function PlanCard({ plan, locale }: { plan: typeof plans[0]; locale: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleBuy = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/mp/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, locale }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/${locale}/login?redirect=/planes`)
          return
        }
        setError(data.error || 'Error al procesar el pago')
        return
      }
      // Redirigir a Mercado Pago
      const url = process.env.NODE_ENV === 'production' ? data.initPoint : data.sandboxInitPoint
      window.location.href = url || data.initPoint
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const isPopular = plan.badge === 'MÁS POPULAR'

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative flex flex-col rounded-2xl p-6 border transition-all duration-300 ${
        isPopular
          ? 'border-[#c1ed00] bg-[#c1ed00]/5 shadow-[0_0_40px_rgba(193,237,0,0.12)]'
          : 'border-white/10 bg-white/3 hover:border-white/20'
      }`}
    >
      {/* Badge */}
      {plan.badge && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black tracking-widest"
          style={{ backgroundColor: plan.color, color: '#0e0e0e' }}
        >
          {plan.badge}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: plan.color }}>
          {plan.days} días
        </p>
        <h2 className="text-2xl font-black text-white mb-3">{plan.name}</h2>
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-sm text-white/40">ARS</span>
          <span className="text-4xl font-black text-white">
            ${plan.price.toLocaleString('es-AR')}
          </span>
        </div>
        <p className="text-sm text-white/50 leading-relaxed">{plan.description}</p>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-white/70">
            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: plan.color }} />
            {f}
          </li>
        ))}
      </ul>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-xs mb-3 text-center bg-red-400/10 rounded-lg py-2 px-3">
          {error}
        </p>
      )}

      {/* CTA */}
      <button
        onClick={handleBuy}
        disabled={loading}
        className="w-full py-3.5 rounded-xl font-black text-sm tracking-wide transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          backgroundColor: loading ? '#333' : plan.color,
          color: '#0e0e0e',
        }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Procesando...
          </span>
        ) : (
          'COMPRAR AHORA'
        )}
      </button>
    </motion.div>
  )
}

export default function PlanesPage({ params }: { params: { locale: string } }) {
  return (
    <div className="bg-[#0e0e0e] min-h-screen text-white relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-[#c1ed00]/4 blur-[160px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-[#00e3fd]/4 blur-[140px] rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="relative z-10 px-4 py-16 max-w-6xl mx-auto">

        {/* Back */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12">
          <Link
            href={`/${params.locale}`}
            className="text-white/30 hover:text-white text-sm transition-colors inline-flex items-center gap-2"
          >
            ← Volver al inicio
          </Link>
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-3">
            Elegí tu plan
          </p>
          <h1 className="text-5xl lg:text-6xl font-black tracking-tighter mb-4">
            TRANSFORMATE<br />
            <span className="text-[#c1ed00] italic">CON R3SET.</span>
          </h1>
          <p className="text-white/50 max-w-lg mx-auto text-base leading-relaxed">
            Entrenamiento personalizado, seguimiento real y un coach que te acompaña.
            Elegí el plan que mejor se adapte a tus objetivos.
          </p>
        </motion.div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map(plan => (
            <PlanCard key={plan.id} plan={plan} locale={params.locale} />
          ))}
        </div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-8 text-white/30 text-xs"
        >
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#c1ed00]" />
            Acceso inmediato al pagar
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#00e3fd]" />
            Pago seguro con Mercado Pago
          </span>
          <span className="flex items-center gap-2">
            <Star className="w-4 h-4 text-[#ff734a]" />
            Soporte por WhatsApp incluido
          </span>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 border-t border-white/10 pt-12"
        >
          <h3 className="text-center font-black text-xl mb-8 text-white/60">Preguntas frecuentes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              { q: '¿Cómo recibo mis accesos?', a: 'Al confirmar el pago, recibís un email y un WhatsApp con el acceso a tu cuenta y al dashboard de R3SET para ver tus rutinas.' },
              { q: '¿Puedo cambiar de plan?', a: 'Sí, cuando venza tu plan actual podés adquirir cualquier otro. Te recomendamos continuar con el trimestral.' },
              { q: '¿El pago es seguro?', a: 'Sí. Procesamos todos los pagos a través de Mercado Pago, la plataforma de pagos más usada en Argentina.' },
              { q: '¿Qué pasa cuando vence mi plan?', a: 'Recibirás una notificación antes del vencimiento. Podés renovar cuando quieras desde tu dashboard.' },
            ].map((faq, i) => (
              <div key={i} className="bg-white/3 rounded-xl p-5 border border-white/8">
                <p className="font-bold text-white/80 text-sm mb-2">{faq.q}</p>
                <p className="text-white/40 text-xs leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  )
}
