'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'

/* ── Plan catalog (matches API route + Supabase) ── */
const PLANS = {
  monthly: {
    id: 'monthly',
    name: { es: 'Mensual', en: 'Monthly', pt: 'Mensal' },
    price: 100,
    period: { es: 'cada mes', en: 'per month', pt: 'por mês' },
    frequency: { es: 'Pago mensual recurrente', en: 'Recurring monthly payment', pt: 'Pagamento mensal recorrente' },
    features: {
      es: ['Rutina de entrenamiento personalizada', 'Videos demostrativos de ejercicios', 'Guía alimentaria + lista de compras', 'App exclusiva (Android + iOS)', 'Soporte por la app'],
      en: ['Personalized training routine', 'Exercise demo videos', 'Food guide + shopping list', 'Exclusive app (Android + iOS)', 'In-app support'],
      pt: ['Rotina de treino personalizada', 'Vídeos demonstrativos', 'Guia alimentar + lista de compras', 'App exclusivo (Android + iOS)', 'Suporte pelo app'],
    },
  },
  quarterly: {
    id: 'quarterly',
    name: { es: 'Trimestral', en: 'Quarterly', pt: 'Trimestral' },
    price: 150,
    period: { es: 'cada 3 meses', en: 'every 3 months', pt: 'a cada 3 meses' },
    frequency: { es: 'Pago trimestral recurrente', en: 'Recurring quarterly payment', pt: 'Pagamento trimestral recorrente' },
    features: {
      es: ['Todo lo del plan Mensual', 'Seguimiento semanal personalizado', 'Ajustes continuos de rutina', 'Prioridad de soporte'],
      en: ['Everything in Monthly', 'Personalized weekly follow-up', 'Continuous routine adjustments', 'Priority support'],
      pt: ['Tudo do plano Mensal', 'Acompanhamento semanal', 'Ajustes contínuos de rotina', 'Suporte prioritário'],
    },
  },
  semiannual: {
    id: 'semiannual',
    name: { es: 'Semestral', en: 'Semi-annual', pt: 'Semestral' },
    price: 200,
    period: { es: 'cada 6 meses', en: 'every 6 months', pt: 'a cada 6 meses' },
    frequency: { es: 'Pago semestral recurrente', en: 'Recurring semi-annual payment', pt: 'Pagamento semestral recorrente' },
    features: {
      es: ['Todo lo del plan Trimestral', 'Plan nutricional completo', 'Comunidad privada WhatsApp', 'Mejor valor por mes'],
      en: ['Everything in Quarterly', 'Complete nutrition plan', 'Private WhatsApp community', 'Best value per month'],
      pt: ['Tudo do plano Trimestral', 'Plano nutricional completo', 'Comunidade privada WhatsApp', 'Melhor custo-benefício'],
    },
  },
} as const

type PlanId = keyof typeof PLANS
type Locale = 'es' | 'en' | 'pt'

/* ── i18n for checkout page ── */
const i18n = {
  es: {
    header_sub: 'Checkout',
    header_title: 'COMPLETÁ TU SUSCRIPCIÓN',
    plan_label: 'Tu plan',
    change_plan: 'Cambiar plan',
    subtotal: 'Subtotal',
    total: 'Total',
    recurring_note: 'Se renueva automáticamente. Podés cancelar en cualquier momento.',
    section_account: 'Tus datos',
    section_account_logged: 'Tu cuenta',
    logged_as: 'Logueado como',
    not_you: '¿No sos vos?',
    have_account: '¿Ya tenés cuenta?',
    sign_in: 'Iniciá sesión',
    no_account: '¿No tenés cuenta?',
    create_account: 'Registrate',
    name_label: 'Nombre completo',
    name_placeholder: 'Tu nombre',
    email_label: 'Email',
    email_placeholder: 'tu@email.com',
    phone_label: 'WhatsApp / Teléfono',
    phone_placeholder: '+54 9 11 1234-5678',
    password_label: 'Contraseña',
    password_placeholder: 'Mínimo 8 caracteres',
    login_email_label: 'Email',
    login_pass_label: 'Contraseña',
    terms: 'He leído y acepto los',
    terms_link: 'términos y condiciones',
    cta_subscribe: 'Suscribirme →',
    cta_processing: 'Procesando...',
    secure_note: 'Pago seguro con Mercado Pago. Tus datos están protegidos.',
    error_required: 'Completá todos los campos obligatorios',
    error_password: 'La contraseña debe tener al menos 8 caracteres',
    error_terms: 'Aceptá los términos y condiciones',
    error_login: 'Email o contraseña incorrectos',
  },
  en: {
    header_sub: 'Checkout',
    header_title: 'COMPLETE YOUR SUBSCRIPTION',
    plan_label: 'Your plan',
    change_plan: 'Change plan',
    subtotal: 'Subtotal',
    total: 'Total',
    recurring_note: 'Renews automatically. Cancel anytime.',
    section_account: 'Your details',
    section_account_logged: 'Your account',
    logged_as: 'Signed in as',
    not_you: 'Not you?',
    have_account: 'Already have an account?',
    sign_in: 'Sign in',
    no_account: "Don't have an account?",
    create_account: 'Create one',
    name_label: 'Full name',
    name_placeholder: 'Your name',
    email_label: 'Email',
    email_placeholder: 'you@email.com',
    phone_label: 'WhatsApp / Phone',
    phone_placeholder: '+1 555 123 4567',
    password_label: 'Password',
    password_placeholder: 'At least 8 characters',
    login_email_label: 'Email',
    login_pass_label: 'Password',
    terms: "I've read and accept the",
    terms_link: 'terms and conditions',
    cta_subscribe: 'Subscribe →',
    cta_processing: 'Processing...',
    secure_note: 'Secure payment with Mercado Pago. Your data is protected.',
    error_required: 'Please fill in all required fields',
    error_password: 'Password must be at least 8 characters',
    error_terms: 'Please accept the terms and conditions',
    error_login: 'Wrong email or password',
  },
  pt: {
    header_sub: 'Checkout',
    header_title: 'COMPLETE SUA ASSINATURA',
    plan_label: 'Seu plano',
    change_plan: 'Mudar plano',
    subtotal: 'Subtotal',
    total: 'Total',
    recurring_note: 'Renova automaticamente. Cancele quando quiser.',
    section_account: 'Seus dados',
    section_account_logged: 'Sua conta',
    logged_as: 'Conectado como',
    not_you: 'Não é você?',
    have_account: 'Já tem conta?',
    sign_in: 'Entrar',
    no_account: 'Não tem conta?',
    create_account: 'Crie uma',
    name_label: 'Nome completo',
    name_placeholder: 'Seu nome',
    email_label: 'Email',
    email_placeholder: 'voce@email.com',
    phone_label: 'WhatsApp / Telefone',
    phone_placeholder: '+55 11 91234-5678',
    password_label: 'Senha',
    password_placeholder: 'Mínimo 8 caracteres',
    login_email_label: 'Email',
    login_pass_label: 'Senha',
    terms: 'Li e aceito os',
    terms_link: 'termos e condições',
    cta_subscribe: 'Assinar →',
    cta_processing: 'Processando...',
    secure_note: 'Pagamento seguro com Mercado Pago. Seus dados estão protegidos.',
    error_required: 'Preencha todos os campos obrigatórios',
    error_password: 'A senha deve ter pelo menos 8 caracteres',
    error_terms: 'Aceite os termos e condições',
    error_login: 'Email ou senha incorretos',
  },
}

export default function CheckoutPage({ params }: { params: { locale: string } }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const locale = (params.locale as Locale) || 'es'
  const t = i18n[locale] ?? i18n.es

  // Plan from URL or default to monthly
  const planParam = searchParams.get('plan') as PlanId | null
  const [selectedPlan, setSelectedPlan] = useState<PlanId>(
    planParam && PLANS[planParam] ? planParam : 'monthly'
  )

  // Auth state
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [mode, setMode] = useState<'register' | 'login'>('register')

  // Form fields
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)

  // State
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPlanPicker, setShowPlanPicker] = useState(false)

  // Check existing session
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        setEmail(user.email ?? '')
        // fetch name from profile
        supabase.from('profiles').select('full_name, phone').eq('id', user.id).single()
          .then(({ data }) => {
            if (data?.full_name) setFullName(data.full_name)
            if (data?.phone) setPhone(data.phone)
          })
      }
      setAuthLoading(false)
    })
  }, [supabase])

  const plan = PLANS[selectedPlan]

  const handleSubmit = async () => {
    setError(null)

    if (!acceptTerms) { setError(t.error_terms); return }

    if (!user) {
      if (mode === 'register') {
        if (!fullName.trim() || !email.trim() || !password) { setError(t.error_required); return }
        if (password.length < 8) { setError(t.error_password); return }
      } else {
        // Login mode
        if (!email.trim() || !password) { setError(t.error_required); return }
      }
    }

    setSubmitting(true)

    try {
      // If login mode and not authenticated, sign in first
      if (!user && mode === 'login') {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
        if (loginError || !data.user) {
          setError(t.error_login)
          setSubmitting(false)
          return
        }
        setUser(data.user)
      }

      // Call create-subscription API
      const res = await fetch('/api/mp/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan,
          locale,
          ...((!user && mode === 'register') ? { email, password, fullName, phone } : {}),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.code === 'USER_EXISTS') {
          setError(data.error)
          setMode('login')
        } else {
          setError(data.error ?? 'Error inesperado')
        }
        setSubmitting(false)
        return
      }

      // Redirect to MercadoPago
      const redirectUrl = data.initPoint || data.sandboxInitPoint
      if (redirectUrl) {
        window.location.href = redirectUrl
      } else {
        setError('No se pudo obtener el enlace de pago')
        setSubmitting(false)
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError('Error de conexión. Intentá de nuevo.')
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setFullName('')
    setEmail('')
    setPhone('')
    setMode('register')
  }

  if (authLoading) return (
    <div className="bg-[#0e0e0e] min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#c8f73a]/30 border-t-[#c8f73a] rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="bg-[#0e0e0e] min-h-screen text-white">
      {/* Ambient */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#c1ed00]/5 blur-[160px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-[#00e3fd]/4 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 lg:py-16">

        {/* Header */}
        <div className="text-center mb-12">
          <Link href={`/${locale}`}>
            <span className="text-xl font-black text-[#c1ed00] font-headline tracking-[-0.04em] uppercase italic">
              METODO R3SET
            </span>
          </Link>
          <p className="text-white/30 text-[10px] uppercase tracking-[0.25em] mt-2">{t.header_sub}</p>
          <h1 className="font-headline font-black text-3xl lg:text-4xl tracking-tight mt-3">{t.header_title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* ── LEFT: Form ── */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 lg:p-8">

              {/* Section title */}
              <h2 className="font-headline font-bold text-lg uppercase tracking-tight mb-6">
                {user ? t.section_account_logged : t.section_account}
              </h2>

              {user ? (
                /* ── Logged in ── */
                <div className="mb-6">
                  <div className="flex items-center justify-between bg-white/5 rounded-xl p-4">
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">{t.logged_as}</p>
                      <p className="text-white font-bold">{fullName || user.email}</p>
                      <p className="text-white/40 text-sm">{user.email}</p>
                    </div>
                    <button onClick={handleLogout} className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white transition-colors">
                      {t.not_you}
                    </button>
                  </div>
                </div>
              ) : mode === 'register' ? (
                /* ── Registration form ── */
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="font-label text-[10px] uppercase tracking-widest text-white/40 block mb-1.5">{t.name_label} *</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                      placeholder={t.name_placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#c8f73a]/50 transition-all" />
                  </div>
                  <div>
                    <label className="font-label text-[10px] uppercase tracking-widest text-white/40 block mb-1.5">{t.email_label} *</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder={t.email_placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#c8f73a]/50 transition-all" />
                  </div>
                  <div>
                    <label className="font-label text-[10px] uppercase tracking-widest text-white/40 block mb-1.5">{t.phone_label}</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                      placeholder={t.phone_placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#c8f73a]/50 transition-all" />
                  </div>
                  <div>
                    <label className="font-label text-[10px] uppercase tracking-widest text-white/40 block mb-1.5">{t.password_label} *</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                      placeholder={t.password_placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#c8f73a]/50 transition-all" />
                  </div>
                  <p className="text-white/30 text-[11px]">
                    {t.have_account}{' '}
                    <button onClick={() => setMode('login')} className="text-[#c8f73a] hover:underline">{t.sign_in}</button>
                  </p>
                </div>
              ) : (
                /* ── Login form ── */
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="font-label text-[10px] uppercase tracking-widest text-white/40 block mb-1.5">{t.login_email_label} *</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder={t.email_placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#c8f73a]/50 transition-all" />
                  </div>
                  <div>
                    <label className="font-label text-[10px] uppercase tracking-widest text-white/40 block mb-1.5">{t.login_pass_label} *</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                      placeholder={t.password_placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#c8f73a]/50 transition-all" />
                  </div>
                  <p className="text-white/30 text-[11px]">
                    {t.no_account}{' '}
                    <button onClick={() => setMode('register')} className="text-[#c8f73a] hover:underline">{t.create_account}</button>
                  </p>
                </div>
              )}

              {/* T&C */}
              <label className="flex items-start gap-3 mb-6 cursor-pointer group">
                <input type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 accent-[#c8f73a]" />
                <span className="text-white/50 text-sm leading-tight">
                  {t.terms}{' '}
                  <Link href={`/${locale}/terms`} className="text-[#c8f73a] hover:underline">{t.terms_link}</Link>
                </span>
              </label>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* CTA */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-[#c8f73a] text-black font-headline font-black text-base py-4 rounded-xl hover:bg-[#d4ff45] transition-all disabled:opacity-60 tracking-wider uppercase active:scale-[0.98]"
              >
                {submitting ? t.cta_processing : t.cta_subscribe}
              </button>

              {/* Secure note */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="material-symbols-outlined text-white/20 text-sm">lock</span>
                <p className="text-white/25 text-[11px]">{t.secure_note}</p>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Plan summary ── */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 lg:p-8 lg:sticky lg:top-8">

              <div className="flex items-center justify-between mb-6">
                <h2 className="font-headline font-bold text-lg uppercase tracking-tight">{t.plan_label}</h2>
                <button onClick={() => setShowPlanPicker(!showPlanPicker)}
                  className="text-[10px] uppercase tracking-widest text-[#c8f73a] hover:underline">
                  {t.change_plan}
                </button>
              </div>

              {/* Plan picker (collapsible) */}
              {showPlanPicker && (
                <div className="mb-6 space-y-2">
                  {(Object.keys(PLANS) as PlanId[]).map(id => {
                    const p = PLANS[id]
                    const isActive = id === selectedPlan
                    return (
                      <button key={id} onClick={() => { setSelectedPlan(id); setShowPlanPicker(false) }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                          isActive
                            ? 'border-[#c8f73a] bg-[#c8f73a]/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}>
                        <span className={`font-headline font-bold text-sm uppercase ${isActive ? 'text-[#c8f73a]' : 'text-white/60'}`}>
                          {p.name[locale]}
                        </span>
                        <span className={`font-headline font-black text-sm ${isActive ? 'text-white' : 'text-white/40'}`}>
                          ${p.price.toLocaleString('es-AR')}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Selected plan card */}
              <div className="bg-[#c8f73a]/5 border border-[#c8f73a]/20 rounded-xl p-5 mb-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[10px] text-[#c8f73a] font-black uppercase tracking-widest mb-1">
                      Plan {plan.name[locale]}
                    </p>
                    <p className="font-headline font-black text-3xl text-white">
                      ${plan.price.toLocaleString('es-AR')}
                    </p>
                    <p className="text-white/40 text-sm mt-0.5">{plan.period[locale]}</p>
                  </div>
                  <div className="bg-[#c8f73a] text-black text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest">
                    R3SET
                  </div>
                </div>
                <p className="text-white/30 text-[11px]">{plan.frequency[locale]}</p>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {plan.features[locale].map((feat, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#c8f73a] text-sm mt-0.5"
                      style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <p className="text-white/60 text-sm">{feat}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/40 text-sm">{t.subtotal}</span>
                  <span className="text-white/60 text-sm">${plan.price.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white font-bold">{t.total}</span>
                  <span className="text-white font-headline font-black text-xl">${plan.price.toLocaleString('es-AR')}</span>
                </div>
                <p className="text-white/25 text-[11px] pt-2">{t.recurring_note}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
